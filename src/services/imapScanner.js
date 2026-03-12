const Imap = require("node-imap");
const { simpleParser } = require("mailparser");
const Campaign = require("../models/Campaign");
const FsockAutoCampaign = require("../models/FsockAutoCampaign");
const CampaignLog = require("../models/CampaignLog");
const TestId = require("../models/TestId");
const MonitoringMailbox = require("../models/MonitoringMailbox");
const crypto = require("crypto");
const { evaluate: guardianEvaluate } = require("./guardianService");
const IntelligenceLog = require("../models/IntelligenceLog");
const ReputationScore = require("../models/ReputationScore");
const socketService = require("./socketService");
const ImapData = require("../models/ImapData");

const determinePlacement = (fName) => {
  const f = (fName || "").toLowerCase();
  // Spam / junk folders
  if (
    f.includes("spam") ||
    f.includes("junk") ||
    f.includes("bulk") ||
    f.includes("quarantine")
  )
    return "spam";
  // Social tab (Gmail [Gmail]/Social or Yahoo Social)
  if (f.includes("social"))
    return "social";
  // Updates tab (Gmail [Gmail]/Updates)
  if (f.includes("update"))
    return "updates";
  // Promotions / Advertising / Forums tab
  if (
    f.includes("promo") ||
    f.includes("advertising") ||
    f.includes("forum")
  )
    return "promo";
  // Everything else is treated as inbox
  return "inbox";
};

/**
 * Modern IMAP Scanner Service
 * Scans monitoring accounts for campaign fingerprints to detect Inbox/Spam/Promotion placement.
 */

const updateIntelligenceScore = async (campaign, type, value, location) => {
  if (!value || value === "Unknown") return;

  let rep = await ReputationScore.findOne({
    assetType: type,
    assetValue: value,
  });
  if (!rep) {
    rep = new ReputationScore({ assetType: type, assetValue: value });
  }

  if (location === "inbox" || location === "promo" || location === "social" || location === "updates") {
    rep.inboxCount += 1;
  } else if (location === "spam") {
    rep.spamCount += 1;
  }

  const total = rep.inboxCount + rep.spamCount;
  if (total > 0) {
    rep.inboxScore = (rep.inboxCount / total) * 100;
  }

  // Update status based on score
  if (rep.inboxScore >= 80) rep.status = "healthy";
  else if (rep.inboxScore >= 50) rep.status = "risky";
  else rep.status = "paused";

  rep.lastChecked = new Date();
  await rep.save();
};

const scanTestId = async (testIdDoc) => {
  return new Promise((resolve, reject) => {
    const imapHost =
      testIdDoc.inboxhostname || testIdDoc.host || "imap.gmail.com";
    const imapPort = parseInt(testIdDoc.port) || 993;

    const imap = new Imap({
      user: testIdDoc.email,
      password: testIdDoc.password,
      host: imapHost,
      port: imapPort,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    });

    const results = [];

    imap.once("ready", () => {
      imap.getBoxes((err, boxes) => {
        if (err) {
          console.error(
            `[IMAP] Error getting boxes for ${testIdDoc.email}:`,
            err,
          );
          imap.end();
          return resolve(results);
        }

        const availableFolders = [];
        const processBoxes = (prefix, folderObj) => {
          for (const key in folderObj) {
            const folder = folderObj[key];
            const fullName = prefix ? prefix + folder.delimiter + key : key;
            availableFolders.push(fullName);
            if (folder.children) processBoxes(fullName, folder.children);
          }
        };
        processBoxes("", boxes);

        const targetKeywords = [
          "inbox",
          "spam",
          "junk",
          "bulk",
          "promo",
          "social",
          "update",
          "advertising",
          "oferta",
          "publicidad",
          "quarantine",
        ];
        const foldersToScan = availableFolders.filter((f) =>
          targetKeywords.some((k) => f.toLowerCase().includes(k)),
        );

        console.log(
          `[IMAP] Found ${availableFolders.length} folders, scanning ${foldersToScan.length} for ${testIdDoc.email}`,
        );

        let folderIdx = 0;
        const checkNextFolder = () => {
          if (folderIdx >= foldersToScan.length) {
            imap.end();
            return resolve(results);
          }

          const folderName = foldersToScan[folderIdx++];
          imap.openBox(folderName, false, (err, box) => {
            if (err) return checkNextFolder();

            if (box.messages.total === 0) return checkNextFolder();

            // Fetch recent messages (including SEEN ones for test email reliability)
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const searchCriteria = [["SINCE", yesterday]];

            imap.search(searchCriteria, (err, searchResults) => {
              if (err || !searchResults.length) return checkNextFolder();

              const finalIds = searchResults.slice(-100);
              const fetch = imap.fetch(finalIds, {
                bodies: [
                  "HEADER.FIELDS (TO SUBJECT FROM DATE MESSAGE-ID X-CAMPAIGN-FINGERPRINT)",
                ],
                markSeen: true,
              });

              let pendingParsers = 0;
              let fetchEnded = false;

              const tryFinish = () => {
                if (fetchEnded && pendingParsers === 0) checkNextFolder();
              };

              fetch.on("message", (msg) => {
                pendingParsers++;
                msg.on("body", (stream) => {
                  simpleParser(stream, async (err, parsed) => {
                    pendingParsers--;
                    if (!err) {
                      const fingerprint = parsed.headers.get(
                        "x-campaign-fingerprint",
                      );
                      const messageId = (parsed.messageId || "").replace(
                        /[<>]/g,
                        "",
                      );

                      const toHeader = parsed.headers.get("to");
                      let toEmail = "";
                      if (toHeader) {
                        if (toHeader.value && toHeader.value[0]) {
                          toEmail = (toHeader.value[0].address || "")
                            .toLowerCase()
                            .trim();
                        } else {
                          toEmail = String(toHeader).toLowerCase().trim();
                        }
                      }

                      const testEmail = testIdDoc.email.toLowerCase().trim();

                      // Legacy compatibility: Populate ImapData for FsockAuto module
                      try {
                        const statusMap = {
                          inbox: "INBOX",
                          promo: "INBOX",
                          spam: "SPAM",
                        };
                        const placementForLegacy =
                          determinePlacement(folderName);
                        const legacyStatus =
                          statusMap[placementForLegacy] || "INBOX";

                        // We use a findOneAndUpdate up-sert to avoid duplicates and handle reclassification
                        await ImapData.findOneAndUpdate(
                          { email: testEmail, message_id: messageId },
                          {
                            $set: {
                              testId: testIdDoc._id,
                              email: testEmail,
                              subject: parsed.subject || "No Subject",
                              from: parsed.from?.text || "Unknown",
                              to: toEmail || testEmail,
                              date: parsed.date || new Date(),
                              message_id: messageId,
                              uid: 1, // Traditional UID matching not strictly needed if we match by Message-ID
                              ip: "0.0.0.0", // Scanner doesn't easily see sending IP from headers without deep parsing
                              status: legacyStatus,
                            },
                          },
                          { upsert: true, new: true },
                        );
                      } catch (legacyErr) {
                        console.error(
                          "[IMAP] Legacy ImapData Sync Error:",
                          legacyErr.message,
                        );
                      }

                      if (
                        fingerprint ||
                        (toEmail &&
                          (toEmail === testEmail ||
                            toEmail.includes(testEmail)))
                      ) {
                        const placement = determinePlacement(folderName);

                        // For spam/promo folders: ONLY trust fingerprint matching.
                        // The `to: email` fallback is too broad — any unrelated email landing
                        // in the test account's spam would be counted as a campaign spam hit.
                        // For inbox: `to: email` fallback is acceptable (less false-positives).
                        if (placement !== "inbox" && !fingerprint) {
                          tryFinish();
                          return;
                        }

                        results.push({
                          fingerprint: fingerprint || "",
                          email: testIdDoc.email,
                          placement,
                        });
                      }
                    }
                    tryFinish();
                  });
                });
              });

              fetch.once("error", (err) => {
                console.error(`[IMAP] Fetch error for ${folderName}:`, err);
                fetchEnded = true;
                tryFinish();
              });

              fetch.once("end", () => {
                fetchEnded = true;
                tryFinish();
              });
            });
          });
        };

        checkNextFolder();
      });
    });

    imap.once("error", (err) => {
      console.error(`IMAP error for ${testIdDoc.email}:`, err);
      resolve(results);
    });

    imap.once("end", () => resolve(results));

    imap.connect();
  });
};

const runScanner = async () => {
  try {
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const activeCampaigns = await Campaign.find({
      $or: [
        { status: { $in: ["Running", "Pending"] } },
        { status: "Completed", updatedAt: { $gte: fifteenMinsAgo } },
      ],
    });

    const activeFsockCampaigns = await FsockAutoCampaign.find({
      $or: [
        { status: { $in: ["Running", "Pending"] } },
        { status: "Completed", updatedAt: { $gte: fifteenMinsAgo } },
      ],
    });

    if (!activeCampaigns.length && !activeFsockCampaigns.length) return;

    // Unify TestIDs and MonitoringMailboxes
    const testIds = await TestId.find({ status: "A" });
    const monitorMailboxes = await MonitoringMailbox.find({ isActive: true });

    const allTargets = [
      ...testIds.map((t) => ({ ...t.toObject(), type: "TestId" })),
      ...monitorMailboxes.map((m) => ({
        ...m.toObject(),
        type: "MonitoringMailbox",
      })),
    ];

    if (!allTargets.length) return;

    const activeCampaignIds = activeCampaigns.map((c) => c._id);

    await Promise.allSettled(
      allTargets.map(async (target) => {
        const scanResults = await scanTestId(target).catch(() => []);

        // ── Per-scan dedup: each email address is classified at most once per scan run.
        // Prevents multi-log campaigns (same address sent N times) from inflating counts.
        const processedEmails = new Set();

        for (const res of scanResults) {
          const dedupeKey = `${res.email}::${res.placement}`;
          if (processedEmails.has(dedupeKey)) continue;

          // Match by mail_status pattern "email@domain.com success"
          // A log is "unclassified" only if ALL placement fields are still 0
          const unclassifiedFilter = {
            inbox: { $in: [0, null] },
            spam: { $in: [0, null] },
            promo: { $in: [0, null] },
            social: { $in: [0, null] },
            updates: { $in: [0, null] },
          };

          let existingLog = await CampaignLog.findOne({
            campaign_id: { $in: activeCampaignIds },
            type: "success",
            mail_status: `${res.email} success`,
            ...unclassifiedFilter,
          }).sort({ created_at: -1 });

          // Fallback to fingerprint
          if (!existingLog && res.fingerprint) {
            existingLog = await CampaignLog.findOne({
              campaign_id: { $in: activeCampaignIds },
              fingerprint: res.fingerprint,
              type: "success",
              ...unclassifiedFilter,
            }).sort({ created_at: -1 });
          }

          // Handle Reclassification (e.g. Spam/Promo/Social/Updates -> Inbox)
          if (!existingLog && res.placement === "inbox") {
            const wronglyClassified = await CampaignLog.findOne({
              campaign_id: { $in: activeCampaignIds },
              type: "success",
              mail_status: {
                $in: [
                  `${res.email} spam`,
                  `${res.email} promo`,
                  `${res.email} social`,
                  `${res.email} updates`,
                ],
              },
            }).sort({ created_at: -1 });

            if (wronglyClassified) {
              // Determine what the old (wrong) placement was
              let oldPlacement = "promo";
              if (wronglyClassified.spam === 1) oldPlacement = "spam";
              else if (wronglyClassified.social === 1) oldPlacement = "social";
              else if (wronglyClassified.updates === 1) oldPlacement = "updates";
              const oldCountField = `${oldPlacement}_count`;

              const correctedCampaign = await Campaign.findByIdAndUpdate(
                wronglyClassified.campaign_id,
                { $inc: { inbox_count: 1, [oldCountField]: -1 } },
                { new: true },
              );

              if (correctedCampaign) {
                const received =
                (correctedCampaign.inbox_count || 0) +
                (correctedCampaign.spam_count || 0) +
                (correctedCampaign.promo_count || 0) +
                (correctedCampaign.social_count || 0) +
                (correctedCampaign.updates_count || 0);
                const totalSent =
                  (correctedCampaign.success_count || 0) +
                  (correctedCampaign.error_count || 0);
                const inboxPercent =
                  (correctedCampaign.total_emails || 0) > 0
                    ? (correctedCampaign.inbox_count /
                        correctedCampaign.total_emails) *
                      100
                    : 0;

                const ipDisplay =
                  wronglyClassified.log_text?.match(
                    /\|\| \[(.*?)\] \|\|/,
                  )?.[1] || "";
                const ipBox = ipDisplay ? ` || [${ipDisplay}]` : "";
                const origSent =
                  wronglyClassified.sent || correctedCampaign.total_emails || 0;

                const finalLog = await CampaignLog.findByIdAndUpdate(
                  wronglyClassified._id,
                  {
                    $set: {
                      inbox: 1,
                      spam: 0,
                      promo: 0,
                      social: 0,
                      updates: 0,
                      log_text: `Total Mail Sent : ${correctedCampaign.total_emails || 0}${ipBox} || Total Mail Received : ${received} || INBOX : ${correctedCampaign.inbox_count || 0} || SPAM : ${correctedCampaign.spam_count || 0} || PROMO : ${correctedCampaign.promo_count || 0} || SOCIAL : ${correctedCampaign.social_count || 0} || UPDATES : ${correctedCampaign.updates_count || 0} || OPENED : ${correctedCampaign.open_count || 0} || MAIL STATUS : ${res.email} inbox || Inbox % : ${inboxPercent.toFixed(1)}%`,
                      inbox_percent: Number(inboxPercent.toFixed(1)),
                      received,
                    },
                  },
                  { new: true },
                );

                // Keep completion log in sync if it exists
                if (correctedCampaign.status === "Completed") {
                  const timeStr = new Date(
                    correctedCampaign.end_time || Date.now(),
                  ).toLocaleTimeString();
                  const latestCompLog = await CampaignLog.findOne({
                    campaign_id: correctedCampaign._id,
                    log_text: /CAMPAIGN COMPLETED/,
                    created_at: { $gte: correctedCampaign.start_time },
                  }).sort({ created_at: -1 });

                  if (latestCompLog) {
                    const updatedCompletionLog =
                      await CampaignLog.findByIdAndUpdate(
                        latestCompLog._id,
                        {
                          $set: {
                            log_text: `[${timeStr}] CAMPAIGN COMPLETED || Total Sent: ${correctedCampaign.total_emails || 0} || Inbox: ${correctedCampaign.inbox_count || 0}`,
                          },
                        },
                        { new: true },
                      );
                    if (updatedCompletionLog) {
                      socketService.emitLog(
                        correctedCampaign._id,
                        updatedCompletionLog,
                        correctedCampaign,
                      );
                    }
                  }
                }

                if (finalLog)
                  socketService.emitLog(
                    correctedCampaign._id,
                    finalLog,
                    correctedCampaign,
                  );
              }
              continue;
            }
          }

          if (existingLog) {
            const campaignId = existingLog.campaign_id;
            const updateField =
              res.placement === "spam"    ? "spam_count"    :
              res.placement === "promo"   ? "promo_count"   :
              res.placement === "social"  ? "social_count"  :
              res.placement === "updates" ? "updates_count" :
                                            "inbox_count";

            const campaign = await Campaign.findByIdAndUpdate(
              campaignId,
              { $inc: { [updateField]: 1 } },
              { new: true },
            );

            if (campaign) {
              const received =
                (campaign.inbox_count || 0) +
                (campaign.spam_count || 0) +
                (campaign.promo_count || 0) +
                (campaign.social_count || 0) +
                (campaign.updates_count || 0);
              const totalSent =
                (campaign.success_count || 0) + (campaign.error_count || 0);
              const inboxPercent =
                (campaign.total_emails || 0) > 0
                  ? (campaign.inbox_count / campaign.total_emails) * 100
                  : 0;
              const inboxLine   = res.placement === "inbox"   ? 1 : 0;
              const spamLine    = res.placement === "spam"    ? 1 : 0;
              const promoLine   = res.placement === "promo"   ? 1 : 0;
              const socialLine  = res.placement === "social"  ? 1 : 0;
              const updatesLine = res.placement === "updates" ? 1 : 0;

              // Fix: use existingLog variables (not reclassification-scope vars)
              const ipDisplay2 =
                existingLog.log_text?.match(/\|\| \[(.*?)\] \|\|/)?.[1] || "";
              const ipBox2 = ipDisplay2 ? ` || [${ipDisplay2}]` : "";
              const origSent2 = existingLog.sent || campaign.total_emails || 0;

              const finalLog = await CampaignLog.findByIdAndUpdate(
                existingLog._id,
                {
                  $set: {
                    inbox:   inboxLine,
                    spam:    spamLine,
                    promo:   promoLine,
                    social:  socialLine,
                    updates: updatesLine,
                    log_text: `Total Mail Sent : ${campaign.total_emails || 0}${ipBox2} || Total Mail Received : ${received} || INBOX : ${campaign.inbox_count || 0} || SPAM : ${campaign.spam_count || 0} || PROMO : ${campaign.promo_count || 0} || SOCIAL : ${campaign.social_count || 0} || UPDATES : ${campaign.updates_count || 0} || OPENED : ${campaign.open_count || 0} || MAIL STATUS : ${res.email} ${res.placement} || Inbox % : ${inboxPercent.toFixed(1)}%`,
                    received,
                    inbox_percent: Number(inboxPercent.toFixed(1)),
                  },
                },
                { new: true },
              );

              // Keep completion log in sync if it exists
              if (campaign.status === "Completed") {
                const timeStr = new Date(
                  campaign.end_time || Date.now(),
                ).toLocaleTimeString();
                const latestCompLog = await CampaignLog.findOne({
                  campaign_id: campaignId,
                  log_text: /CAMPAIGN COMPLETED/,
                  created_at: { $gte: campaign.start_time },
                }).sort({ created_at: -1 });

                if (latestCompLog) {
                  const updatedCompletionLog =
                    await CampaignLog.findByIdAndUpdate(
                      latestCompLog._id,
                      {
                        $set: {
                          log_text: `[${timeStr}] CAMPAIGN COMPLETED || Total Sent: ${campaign.total_emails || 0} || Inbox: ${campaign.inbox_count || 0}`,
                        },
                      },
                      { new: true },
                    );
                  if (updatedCompletionLog) {
                    socketService.emitLog(
                      campaignId,
                      updatedCompletionLog,
                      campaign,
                    );
                  }
                }
              }

              if (finalLog) {
                processedEmails.add(dedupeKey); // Mark as done only after successful write
                socketService.emitLog(campaignId, finalLog, campaign);
              }

              // Update Intelligence Score
              try {
                const ipMatch = existingLog.log_text
                  ? existingLog.log_text.match(/\d+\.\d+\.\d+\.\d+/)
                  : null;
                const ip = ipMatch ? ipMatch[0] : campaign.server;
                if (ip)
                  await updateIntelligenceScore(
                    campaign,
                    "ip",
                    ip,
                    res.placement,
                  );
                if (campaign.domain)
                  await updateIntelligenceScore(
                    campaign,
                    "domain",
                    campaign.domain,
                    res.placement,
                  );

                await IntelligenceLog.create({
                  campaignId,
                  provider: res.email.split("@")[1]?.split(".")[0] || "other",
                  // Treat promo/social/updates as non-spam inbox-adjacent for intelligence scoring
                  location: (res.placement === "promo" || res.placement === "social" || res.placement === "updates") ? "inbox" : res.placement,
                  testEmail: res.email,
                  subject: existingLog.subject || "IMAP Scan",
                });
              } catch (e) {}
            }
          }
        }
      }),
    );

    for (const campaign of activeCampaigns) {
      await guardianEvaluate(campaign._id).catch(() => {});
    }
  } catch (error) {
    console.error("Scanner run error:", error);
  }
};

module.exports = { runScanner };
