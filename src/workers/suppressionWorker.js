const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const OfferSuppQueue = require("../models/OfferSuppQueue");
const EmailMaster = require("../models/EmailMaster");
const ComplainerSuppression = require("../models/ComplainerSuppression");

const { DATA_PATH, SUPPRESSION_DIR } = require("../config/paths");

/**
 * Suppression Worker Logic
 * Ported from supp.php
 */

const processSuppression = async (queueId) => {
  try {
    const queueItem = await OfferSuppQueue.findById(queueId);
    if (!queueItem) return;

    // 1. Update status to Running
    await OfferSuppQueue.findByIdAndUpdate(queueId, {
      status: 2,
      log: "Processing...",
    });

    const sourcePath = path.join(DATA_PATH, queueItem.filename);
    const vendorPath = queueItem.vendor_supp_filename
      ? path.join(SUPPRESSION_DIR, queueItem.vendor_supp_filename)
      : null;
    const outputPath = path.join(
      DATA_PATH,
      queueItem.new_filename || `suppressed_${queueItem.filename}`,
    );

    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source file missing: ${sourcePath}`);
    }

    // 2. Load Suppression Data (MD5s or Emails)
    const suppressionSet = new Set();
    if (vendorPath && fs.existsSync(vendorPath)) {
      const vendorData = fs
        .readFileSync(vendorPath, "utf8")
        .split(/\r?\n/)
        .filter((line) => line.trim());
      vendorData.forEach((item) =>
        suppressionSet.add(item.trim().toLowerCase()),
      );
    }

    // 3. Process Source File
    const sourceData = fs
      .readFileSync(sourcePath, "utf8")
      .split(/\r?\n/)
      .filter((line) => line.trim());
    const initialCount = sourceData.length;

    // We filter based on MD5 or Email
    const resultEmails = [];
    for (const line of sourceData) {
      const email = line.trim().toLowerCase();
      const md5 = crypto.createHash("md5").update(email).digest("hex");

      if (!suppressionSet.has(email) && !suppressionSet.has(md5)) {
        resultEmails.push(email);
      }
    }

    // 4. Save Final File
    fs.writeFileSync(outputPath, resultEmails.join("\n"));

    // 5. Update status to Complete
    await OfferSuppQueue.findByIdAndUpdate(queueId, {
      status: 1,
      final_file_count: resultEmails.length,
      suppressed_file_count: initialCount - resultEmails.length,
      log: "Completed Successfully",
      date_completed: new Date(),
    });
  } catch (error) {
    console.error("Suppression Worker Error:", error.message);
    await OfferSuppQueue.findByIdAndUpdate(queueId, {
      status: 3,
      log: `Error: ${error.message}`,
    });
  }
};

module.exports = { processSuppression };
