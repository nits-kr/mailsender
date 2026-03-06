const Imap = require("node-imap");
const { simpleParser } = require("mailparser");
const Campaign = require("../models/Campaign");
const CampaignLog = require("../models/CampaignLog");
const TestId = require("../models/TestId");
const crypto = require("crypto");
const { evaluate: guardianEvaluate } = require("./guardianService");
const IntelligenceLog = require("../models/IntelligenceLog");
const ReputationScore = require("../models/ReputationScore");
const socketService = require("./socketService");

/**
 * Modern IMAP Scanner Service
 * Scans TestId accounts for campaign fingerprints to detect Inbox/Spam/Promotion placement.
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
    const imap = new Imap({
      user: testIdDoc.email,
      password: testIdDoc.password,
      host:
        testIdDoc.inboxhostname || testIdDoc.spamhostname || "imap.gmail.com",
      port: parseInt(testIdDoc.port) || 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    });

    const results = [];

    imap.once("ready", () => {
      // Fetch list of folders to see what's actually available
      imap.getBoxes((err, boxes) => {
        if (err) {
          console.error(
            `[IMAP] Error getting boxes for ${testIdDoc.email}:`,
            err,
          );
          imap.end();
          return resolve(results);
        }

        // Flatten boxes to a simple array of names
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

        // Outlook/Hotmail uses "Junk", "Junk Email"
        // AOL uses "Spam" or "Bulk Mail"
        // iCloud uses "Junk"
        const targetKeywords = [
          "inbox",
          "spam",
          "junk", // Outlook, Hotmail, iCloud
          "bulk", // Yahoo, AOL
          "promo",
          "social",
          "update",
          "advertising",
          "oferta",
          "publicidad",
          "quarantine", // Some corporate filters
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
            // false = read/write so we can mark seen
            if (err) {
              // Folder might not exist or other error, skip
              return checkNextFolder();
            }

            if (box.messages.total === 0) {
              console.log(
                `[IMAP] Folder ${folderName} empty for ${testIdDoc.email}`,
              );
              return checkNextFolder();
            }

            console.log(
              `[IMAP] Scanning ${folderName} (${box.messages.total} msgs) for ${testIdDoc.email}...`,
            );

            // ONLY process UNSEEN messages so we don't double-count across multiple test runs!
            const searchCriteria = ["UNSEEN"];
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 2);
            searchCriteria.push(["SINCE", yesterday]);

            imap.search(searchCriteria, (err, searchResults) => {
              if (err || !searchResults.length) {
                return checkNextFolder();
              }

              // Limit to last 100 messages to avoid timeouts
              const finalIds = searchResults.slice(-100);
              // Fetch standard TO header (Yahoo strips custom X-headers so we must use TO)
              const fetch = imap.fetch(finalIds, {
                bodies: "HEADER.FIELDS (TO X-CAMPAIGN-FINGERPRINT)",
                markSeen: true, // Marks email as read so we never double count it!
              });

              let pendingParsers = 0;
              let fetchEnded = false;

              const tryFinish = () => {
                if (fetchEnded && pendingParsers === 0) {
                  checkNextFolder();
                }
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

                      // If we have a fingerprint OR if the email was sent TO this TestId
                      // (Yahoo/AOL strip fingerprints, so we MUST fall back to To-matching)
                      if (
                        fingerprint ||
                        (toEmail &&
                          (toEmail === testEmail ||
                            toEmail.includes(testEmail)))
                      ) {
                        const determinePlacement = (fName) => {
                          const f = fName.toLowerCase();
                          if (
                            f.includes("spam") || // Gmail, AOL
                            f.includes("junk") || // Outlook, Hotmail, iCloud
                            f.includes("bulk") || // Yahoo, AOL
                            f.includes("quarantine") // Corporate Filters
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

                        const placement = determinePlacement(folderName);

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
      resolve(results); // resolve even on error to continue others
    });

    imap.once("end", () => {
      resolve(results);
    });

    imap.connect();
  });
};

const runScanner = async () => {
  try {
    // Include recently completed campaigns (last 15 minutes) to catch late deliveries
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const activeCampaigns = await Campaign.find({
      $or: [
        { status: { $in: ["Running", "Pending"] } },
        { status: "Completed", updatedAt: { $gte: fifteenMinsAgo } },
      ],
    });
    if (!activeCampaigns.length) {
      console.log(
        "[IMAP Scanner] No active or recently completed campaigns found. Skipping.",
      );
      return;
    }

    const testIds = await TestId.find({ status: "A" });
    if (!testIds.length) {
      const totalCount = await TestId.countDocuments({});
      console.log(
        `[IMAP Scanner] No active TestIDs found in DB (Total records in DB: ${totalCount}). Skipping.`,
      );
      return;
    }

    console.log(
      `Starting IMAP scan for ${activeCampaigns.length} campaigns across ${testIds.length} TestIDs`,
    );
    const activeCampaignIds = activeCampaigns.map((c) => c._id);

    await Promise.allSettled(
      testIds.map(async (testId) => {
        console.log(`[IMAP] Connecting to ${testId.email}...`);
        const scanResults = await scanTestId(testId).catch((err) => {
          console.error(`[IMAP] Scan failed for ${testId.email}:`, err.message);
          return [];
        });

        if (scanResults.length > 0) {
          console.log(
            `[IMAP] Found ${scanResults.length} fingerprint matches in ${testId.email}`,
          );
        }

        for (const res of scanResults) {
          // PRIMARY: Match by exact recipient email in mail_status — extremely fast with indexes.
          // We know emailWorker saves this exactly as "user@domain.com success".
          let existingLog = await CampaignLog.findOne({
            campaign_id: { $in: activeCampaignIds },
            type: "success",
            mail_status: `${res.email} success`,
            inbox: { $in: [0, null] },
            spam: { $in: [0, null] },
            promo: { $in: [0, null] },
          }).sort({ created_at: -1 });

          // SECONDARY: Fingerprint match (works when header survives transit)
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

          // TERTIARY: Reclassification check — email was previously marked as wrong placement
          // (e.g. first scan found it in [Bulk]/Spam, but email was actually delivered to Inbox)
          // This corrects the campaign aggregate counts and the log entry.
          if (!existingLog && res.placement === "inbox") {
            const wronglyClassified = await CampaignLog.findOne({
              campaign_id: { $in: activeCampaignIds },
              type: "success",
              mail_status: {
                $in: [`${res.email} spam`, `${res.email} promo`],
              },
            }).sort({ created_at: -1 });

            if (wronglyClassified) {
              const oldPlacement =
                wronglyClassified.spam === 1 ? "spam" : "promo";
              const oldCountField =
                oldPlacement === "spam" ? "spam_count" : "promo_count";
              console.log(
                `[IMAP] Reclassifying ${res.email}: ${oldPlacement} → inbox (correcting counts)`,
              );

              // Correct the campaign aggregate stats atomically
              const correctedCampaign = await Campaign.findByIdAndUpdate(
                wronglyClassified.campaign_id,
                { $inc: { inbox_count: 1, [oldCountField]: -1 } },
                { new: true },
              );

              if (correctedCampaign) {
                const received =
                  (correctedCampaign.inbox_count || 0) +
                  Math.max(0, correctedCampaign.spam_count || 0) +
                  Math.max(0, correctedCampaign.promo_count || 0);

                const currentLiveTotalSent =
                  (correctedCampaign.success_count || 0) +
                  (correctedCampaign.error_count || 0);

                const totalSentText =
                  wronglyClassified.sent || currentLiveTotalSent; // keep chronological text mapping but use live sent for math

                const inboxPercent =
                  currentLiveTotalSent > 0
                    ? (correctedCampaign.inbox_count / currentLiveTotalSent) *
                      100
                    : 0;

                const newLogText =
                  `Total Mail Sent : ${totalSentText} || ` +
                  `Total Mail Received : ${received} || ` +
                  `INBOX : 1 || ` +
                  `SPAM : 0 || ` +
                  `MAIL STATUS : ${res.email} inbox || ` +
                  `Inbox Percentage : ${inboxPercent.toFixed(1)}%`;

                await CampaignLog.findByIdAndUpdate(
                  wronglyClassified._id,
                  {
                    $set: {
                      inbox: 1,
                      spam: 0,
                      promo: 0,
                      mail_status: `${res.email} inbox`,
                      log_text: newLogText,
                      inbox_percent: Number(inboxPercent.toFixed(1)),
                      received: received,
                    },
                  },
                  { new: true },
                );
                if (finalLog) {
                  socketService.emitLog(
                    wronglyClassified.campaign_id,
                    finalLog,
                  );
                }
              }
              // Skip normal placement flow — already handled
              continue;
            }
          }

          // Only count if an unplaced log was found (avoid double counting if scanner runs twice)
          if (existingLog) {
            console.log(
              `[IMAP] Verified DB Match! TestID: ${res.email}, DB Log ID: ${existingLog._id}, Location: ${res.placement}`,
            );
            const campaignId = existingLog.campaign_id;
            const updateField =
              res.placement === "spam"
                ? "spam_count"
                : res.placement === "promo"
                  ? "promo_count"
                  : "inbox_count";

            // Grab the live total sent before updating so we can preserve sequential text mapping
            const tempCampaign = await Campaign.findById(campaignId);
            const liveCampaignTotalSent = tempCampaign
              ? (tempCampaign.success_count || 0) +
                (tempCampaign.error_count || 0)
              : 0;
            const totalSentText = existingLog.sent || liveCampaignTotalSent;

            // 1. Update the specific Log Entry FIRST
            const updatedLog = await CampaignLog.findByIdAndUpdate(
              existingLog._id,
              {
                $set: {
                  [res.placement]: 1,
                  mail_status: `${res.email} ${res.placement}`,
                  // log_text is calculated below after we get the Campaign aggregates
                  sent: totalSentText,
                },
              },
              { new: true }, // Return the updated document
            );

            if (updatedLog) {
              // 2. ONLY Update Campaign Aggregate Stats if the log was successfully claimed
              // (Prevents IMAP race conditions from double-counting the aggregate if the UNSEEN flag was slow to sync)
              const campaign = await Campaign.findByIdAndUpdate(
                campaignId,
                { $inc: { [updateField]: 1 } },
                { new: true },
              );

              if (campaign) {
                const received =
                  (campaign.inbox_count || 0) +
                  Math.max(0, campaign.spam_count || 0) +
                  Math.max(0, campaign.promo_count || 0);

                const inboxPercent =
                  liveCampaignTotalSent > 0
                    ? (campaign.inbox_count / liveCampaignTotalSent) * 100
                    : 0;

                const inboxCountLine = res.placement === "inbox" ? 1 : 0;
                const spamCountLine = res.placement === "spam" ? 1 : 0;

                const newLogText = `Total Mail Sent : ${totalSentText} || Total Mail Received : ${received} || INBOX : ${inboxCountLine} || SPAM : ${spamCountLine} || MAIL STATUS : ${res.email} ${res.placement} || Inbox Percentage : ${inboxPercent.toFixed(1)}%`;

                // 3. Finalize the Log Entry with the live math text
                const finalLog = await CampaignLog.findByIdAndUpdate(
                  existingLog._id,
                  {
                    $set: {
                      log_text: newLogText,
                      inbox_percent: Number(inboxPercent.toFixed(1)),
                      received: received,
                    },
                  },
                  { new: true },
                );
                if (finalLog) {
                  socketService.emitLog(campaignId, finalLog);
                }
              }
            }

            // ── Synchronize with Inbox Intelligence Engine ───────────────
            const providerMatch =
              res.email.split("@")[1]?.split(".")[0] || "other";
            const provider = ["gmail", "yahoo", "outlook"].includes(
              providerMatch,
            )
              ? providerMatch
              : "other";

            try {
              await IntelligenceLog.create({
                campaignId,
                provider,
                location: res.placement === "promo" ? "inbox" : res.placement,
                testEmail: res.email,
                subject: existingLog.log_text || "Automated IMAP Scan",
              });

              const campaign = activeCampaigns.find(
                (c) => c._id.toString() === campaignId.toString(),
              );
              if (campaign) {
                // Extract IP from recent log since campaign.server isn't always reliable
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
              }
            } catch (intelErr) {
              console.error(
                "[IMAP] Intelligence Sync Error:",
                intelErr.message,
              );
            }
          }
        }
      }),
    );

    // After all scans, evaluate Guardian thresholds for all active campaigns
    for (const campaign of activeCampaigns) {
      await guardianEvaluate(campaign._id).catch((err) =>
        console.error(`Guardian eval error for ${campaign._id}:`, err),
      );
    }
  } catch (error) {
    console.error("Scanner run error:", error);
  }
};

module.exports = { runScanner };
