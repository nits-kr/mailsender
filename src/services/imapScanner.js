const Imap = require("node-imap");
const { simpleParser } = require("mailparser");
const Campaign = require("../models/Campaign");
const CampaignLog = require("../models/CampaignLog");
const TestId = require("../models/TestId");
const crypto = require("crypto");
const { evaluate: guardianEvaluate } = require("./guardianService");

/**
 * Modern IMAP Scanner Service
 * Scans TestId accounts for campaign fingerprints to detect Inbox/Spam/Promotion placement.
 */

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
      // Folders to scan - expanded for better Gmail/Yahoo compatibility
      const folders = [
        "INBOX",
        "Spam",
        "Junk",
        "[Gmail]/Spam",
        "[Gmail]/Promotions",
        "[Gmail]/Social",
        "[Gmail]/Updates",
        "Categories/Promotions",
        "Categories/Social",
        "Promozioni", // Italian
        "Promociones", // Spanish
        "Promotions",
      ];
      let foldersChecked = 0;

      const checkNextFolder = () => {
        if (foldersChecked >= folders.length) {
          imap.end();
          return resolve(results);
        }

        const folderName = folders[foldersChecked++];
        imap.openBox(folderName, true, (err, box) => {
          if (err) {
            // Folder might not exist, skip
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

          // Search for messages with X-Campaign-Fingerprint header in the last 24 hours
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          imap.search(["ALL", ["SINCE", yesterday]], (err, searchResults) => {
            if (err || !searchResults.length) {
              return checkNextFolder();
            }

            const fetch = imap.fetch(searchResults, {
              bodies: "HEADER.FIELDS (X-CAMPAIGN-FINGERPRINT SUBJECT FROM)",
              struct: true,
            });

            fetch.on("message", (msg) => {
              msg.on("body", (stream) => {
                simpleParser(stream, async (err, parsed) => {
                  if (err) return;

                  const fingerprint = parsed.headers.get(
                    "x-campaign-fingerprint",
                  );
                  if (fingerprint) {
                    // Match fingerprint with active campaigns
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
                            : folderName.toLowerCase().includes("promotions")
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
                });
              });
            });

            fetch.once("end", () => {
              checkNextFolder();
            });
          });
        });
      };

      checkNextFolder();
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
        // Update Stats ONLY if not already counted to prevent double-counting
        const existingLog = await CampaignLog.findOne({
          campaign_id: res.campaignId,
          mail_status: new RegExp(`^${res.email}`, "i"),
        });

        // Only count if it hasn't been placed yet (no inbox/spam/promo field set)
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

          await Campaign.findByIdAndUpdate(res.campaignId, {
            $inc: { [updateField]: 1 },
          });

          await CampaignLog.findByIdAndUpdate(existingLog._id, {
            $set: {
              [res.placement]: 1,
              mail_status: `${res.email} ${res.placement}`,
            },
          });
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
