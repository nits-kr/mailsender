const Imap = require("node-imap");
const { simpleParser } = require("mailparser");
const Campaign = require("../models/Campaign");
const CampaignLog = require("../models/CampaignLog");
const TestId = require("../models/TestId");
const MonitoringMailbox = require("../models/MonitoringMailbox");
const crypto = require("crypto");
const { evaluate: guardianEvaluate } = require("./guardianService");
const IntelligenceLog = require("../models/IntelligenceLog");
const ReputationScore = require("../models/ReputationScore");
const socketService = require("./socketService");

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

  if (location === "inbox" || location === "promo") {
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
                bodies: "HEADER.FIELDS (TO X-CAMPAIGN-FINGERPRINT)",
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

                      if (
                        fingerprint ||
                        (toEmail &&
                          (toEmail === testEmail ||
                            toEmail.includes(testEmail)))
                      ) {
                        const determinePlacement = (fName) => {
                          const f = fName.toLowerCase();
                          if (
                            f.includes("spam") ||
                            f.includes("junk") ||
                            f.includes("bulk") ||
                            f.includes("quarantine")
                          )
                            return "spam";
                          if (
                            f.includes("promo") ||
                            f.includes("social") ||
                            f.includes("update") ||
                            f.includes("advertising") ||
                            f.includes("forum")
                          )
                            return "promo";
                          return "inbox";
                        };

                        results.push({
                          fingerprint: fingerprint || "",
                          email: testIdDoc.email,
                          placement: determinePlacement(folderName),
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

    if (!activeCampaigns.length) return;

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

        for (const res of scanResults) {
          // Match by mail_status pattern "email@domain.com success"
          let existingLog = await CampaignLog.findOne({
            campaign_id: { $in: activeCampaignIds },
            type: "success",
            mail_status: `${res.email} success`,
            inbox: { $in: [0, null] },
            spam: { $in: [0, null] },
            promo: { $in: [0, null] },
          }).sort({ created_at: -1 });

          // Fallback to fingerprint
          if (!existingLog && res.fingerprint) {
            existingLog = await CampaignLog.findOne({
              campaign_id: { $in: activeCampaignIds },
              fingerprint: res.fingerprint,
              type: "success",
              inbox: { $in: [0, null] },
              spam: { $in: [0, null] },
              promo: { $in: [0, null] },
            }).sort({ created_at: -1 });
          }

          // Handle Reclassification (e.g. Spam -> Inbox)
          if (!existingLog && res.placement === "inbox") {
            const wronglyClassified = await CampaignLog.findOne({
              campaign_id: { $in: activeCampaignIds },
              type: "success",
              mail_status: { $in: [`${res.email} spam`, `${res.email} promo`] },
            }).sort({ created_at: -1 });

            if (wronglyClassified) {
              const oldPlacement =
                wronglyClassified.spam === 1 ? "spam" : "promo";
              const oldCountField =
                oldPlacement === "spam" ? "spam_count" : "promo_count";

              const correctedCampaign = await Campaign.findByIdAndUpdate(
                wronglyClassified.campaign_id,
                { $inc: { inbox_count: 1, [oldCountField]: -1 } },
                { new: true },
              );

              if (correctedCampaign) {
                const received =
                  (correctedCampaign.inbox_count || 0) +
                  (correctedCampaign.spam_count || 0) +
                  (correctedCampaign.promo_count || 0);
                const totalSent =
                  (correctedCampaign.success_count || 0) +
                  (correctedCampaign.error_count || 0);
                const inboxPercent =
                  totalSent > 0
                    ? (correctedCampaign.inbox_count / totalSent) * 100
                    : 0;

                const finalLog = await CampaignLog.findByIdAndUpdate(
                  wronglyClassified._id,
                  {
                    $set: {
                      inbox: 1,
                      spam: 0,
                      promo: 0,
                      // log_text: \`Total Mail Sent : \${wronglyClassified.sent || totalSent} || Total Mail Received : \${received}\` // Incremental
                      log_text: `[FS_FIXED] Total Mail Sent : ${correctedCampaign.total_emails || 0} || Total Mail Received : ${received} || INBOX : ${correctedCampaign.inbox_count || 0} || SPAM : ${correctedCampaign.spam_count || 0} || MAIL STATUS : ${res.email} inbox || Inbox Percentage : ${inboxPercent.toFixed(1)}%`,
                      inbox_percent: Number(inboxPercent.toFixed(1)),
                      received,
                    },
                  },
                  { new: true },
                );
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
              res.placement === "spam"
                ? "spam_count"
                : res.placement === "promo"
                  ? "promo_count"
                  : "inbox_count";

            const campaign = await Campaign.findByIdAndUpdate(
              campaignId,
              { $inc: { [updateField]: 1 } },
              { new: true },
            );

            if (campaign) {
              const received =
                (campaign.inbox_count || 0) +
                (campaign.spam_count || 0) +
                (campaign.promo_count || 0);
              const totalSent =
                (campaign.success_count || 0) + (campaign.error_count || 0);
              const inboxPercent =
                totalSent > 0 ? (campaign.inbox_count / totalSent) * 100 : 0;
              const inboxLine = res.placement === "inbox" ? 1 : 0;
              const spamLine = res.placement === "spam" ? 1 : 0;

              const finalLog = await CampaignLog.findByIdAndUpdate(
                existingLog._id,
                {
                  $set: {
                    [res.placement]: 1,
                    // log_text: \`Total Mail Sent : \${existingLog.sent || totalSent} || Total Mail Received : \${received}\` // Incremental
                    log_text: `[FS_FIXED] Total Mail Sent : ${campaign.total_emails || 0} || Total Mail Received : ${received} || INBOX : ${campaign.inbox_count || 0} || SPAM : ${campaign.spam_count || 0} || MAIL STATUS : ${res.email} ${res.placement} || Inbox Percentage : ${inboxPercent.toFixed(1)}%`,
                    received,
                    inbox_percent: Number(inboxPercent.toFixed(1)),
                  },
                },
                { new: true },
              );
              if (finalLog)
                socketService.emitLog(campaignId, finalLog, campaign);

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
                  location: res.placement === "promo" ? "inbox" : res.placement,
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
