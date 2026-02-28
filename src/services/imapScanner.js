const Imap = require("node-imap");
const { simpleParser } = require("mailparser");
const Campaign = require("../models/Campaign");
const CampaignLog = require("../models/CampaignLog");
const TestId = require("../models/TestId");
const crypto = require("crypto");
const { evaluate: guardianEvaluate } = require("./guardianService");
const IntelligenceLog = require("../models/IntelligenceLog");
const ReputationScore = require("../models/ReputationScore");

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

const scanTestId = async (testIdDoc, activeCampaigns) => {
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

        // Filter folders we want to check
        const targetKeywords = [
          "inbox",
          "spam",
          "junk",
          "promo",
          "social",
          "update",
          "advertising",
          "oferta",
          "publicidad",
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
          imap.openBox(folderName, true, (err, box) => {
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

            // Search for messages with our fingerprint header
            // Note: Not all IMAP servers support Searching custom headers, so we fallback to recent
            const searchCriteria = ["ALL"];
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            searchCriteria.push(["SINCE", yesterday]);

            imap.search(searchCriteria, (err, searchResults) => {
              if (err || !searchResults.length) {
                return checkNextFolder();
              }

              // Limit to last 100 messages to avoid timeouts
              const finalIds = searchResults.slice(-100);
              const fetch = imap.fetch(finalIds, {
                bodies: "HEADER.FIELDS (X-CAMPAIGN-FINGERPRINT)",
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
                      if (fingerprint) {
                        for (const campaign of activeCampaigns) {
                          const expectedFingerprint = crypto
                            .createHash("md5")
                            .update(`${campaign._id}:${testIdDoc.email}`)
                            .digest("hex");

                          if (fingerprint === expectedFingerprint) {
                            const placement =
                              folderName.toLowerCase().includes("spam") ||
                              folderName.toLowerCase().includes("junk")
                                ? "spam"
                                : folderName.toLowerCase().includes("promo") ||
                                    folderName
                                      .toLowerCase()
                                      .includes("social") ||
                                    folderName.toLowerCase().includes("update")
                                  ? "promo"
                                  : "inbox";

                            results.push({
                              campaignId: campaign._id,
                              email: testIdDoc.email,
                              placement,
                            });
                          }
                        }
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
    if (!activeCampaigns.length) return;

    const testIds = await TestId.find({ status: "A" });
    if (!testIds.length) return;

    console.log(
      `Starting IMAP scan for ${activeCampaigns.length} campaigns across ${testIds.length} TestIDs`,
    );

    for (const testId of testIds) {
      console.log(`[IMAP] Connecting to ${testId.email}...`);
      const scanResults = await scanTestId(testId, activeCampaigns).catch(
        (err) => {
          console.error(`[IMAP] Scan failed for ${testId.email}:`, err.message);
          return [];
        },
      );

      if (scanResults.length > 0) {
        console.log(
          `[IMAP] Found ${scanResults.length} fingerprint matches in ${testId.email}`,
        );
      }

      for (const res of scanResults) {
        // Find the "SENT SUCCESS" log for this email to link the placement
        const existingLog = await CampaignLog.findOne({
          campaign_id: res.campaignId,
          mail_status: new RegExp(`${res.email} success`, "i"),
        });

        // Only count if it hasn't been placed yet (avoid double counting if scanner runs twice)
        if (
          existingLog &&
          !existingLog.inbox &&
          !existingLog.spam &&
          !existingLog.promo
        ) {
          const updateField =
            res.placement === "spam"
              ? "spam_count"
              : res.placement === "promo"
                ? "promo_count"
                : "inbox_count";

          // 1. Update Campaign Aggregate Stats
          await Campaign.findByIdAndUpdate(res.campaignId, {
            $inc: { [updateField]: 1 },
          });

          // 2. Update the specific Log Entry
          await CampaignLog.findByIdAndUpdate(existingLog._id, {
            $set: {
              [res.placement]: 1,
              mail_status: `${res.email} ${res.placement}`,
            },
          });

          // ── Synchronize with Inbox Intelligence Engine ───────────────
          const providerMatch =
            res.email.split("@")[1]?.split(".")[0] || "other";
          const provider = ["gmail", "yahoo", "outlook"].includes(providerMatch)
            ? providerMatch
            : "other";

          try {
            await IntelligenceLog.create({
              campaignId: res.campaignId,
              provider,
              location: res.placement === "promo" ? "inbox" : res.placement,
              testEmail: res.email,
              subject: existingLog.log_text || "Automated IMAP Scan",
            });

            const campaign = activeCampaigns.find(
              (c) => c._id.toString() === res.campaignId.toString(),
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
            console.error("[IMAP] Intelligence Sync Error:", intelErr.message);
          }
        }
      }
    }

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
