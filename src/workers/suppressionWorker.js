const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const mongoose = require("mongoose");
const OfferSuppQueue = require("../models/OfferSuppQueue");
const pool = require("../config/mysql");
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Worker connected to MongoDB"))
  .catch((err) => console.error("Worker MongoDB connection error:", err));

const processQueue = async () => {
  const item = await OfferSuppQueue.findOne({ status: 0 }).sort({
    createdAt: 1,
  });
  if (!item) return;

  console.log(`Processing queue item: ${item._id}`);
  item.status = 2; // Running
  await item.save();

  const logDir = path.join(__dirname, "../../suppression/logs");
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  const logFile = path.join(logDir, `${item._id}.log`);
  const logStream = fs.createWriteStream(logFile, { flags: "a" });

  const writeLog = (msg) => {
    const timestamp = new Date().toISOString();
    logStream.write(`[${timestamp}] ${msg}\n`);
    console.log(msg);
  };

  try {
    const sourceFilePath = `/var/www/data/${item.filename}`;
    const vendorSuppPath = path.join(
      __dirname,
      "../../suppression/vendor_suppression_uploaded_files",
      item.vendor_supp_filename,
    );
    const outputFilePath = `/var/www/data/${item.new_filename}`;

    writeLog(
      `Starting suppression for ${item.filename} against ${item.vendor_supp_filename}`,
    );

    // Simplified suppression logic using grep -v -f
    // -v: inverted match (keep lines NOT in vendor file)
    // -f: use patterns from file
    // Caution: grep -v -f is slow for very large files, but consistent with legacy

    // Legacy extracted second column (email/md5) from CSV for source
    // item.filename is assumed to be in /var/www/data/ and already processed or need processing

    // To match legacy supp.php exactly, we might need to use its exact shell commands
    // For now, let's use a robust shell command for modernization

    const cmd = `grep -v -F -f "${vendorSuppPath}" "${sourceFilePath}" > "${outputFilePath}"`;

    writeLog(`Executing: ${cmd}`);

    exec(cmd, async (error, stdout, stderr) => {
      if (error) {
        writeLog(`Error: ${error.message}`);
        item.status = 3; // Error
        item.log = error.message;
        await item.save();
        logStream.end();
        return;
      }

      writeLog(`Suppression completed. Output saved to ${item.new_filename}`);

      // Update counts
      try {
        const initialCount = parseInt(
          fs.readFileSync(sourceFilePath, "utf8").split("\n").length,
        );
        const finalCount = parseInt(
          fs.readFileSync(outputFilePath, "utf8").split("\n").length,
        );

        item.initial_file_count = initialCount;
        item.final_file_count = finalCount;
        item.suppressed_file_count = initialCount - finalCount;
        item.status = 1; // Completed
        item.date_completed = new Date();
        item.log = "Suppressed Successfully";
        await item.save();
        writeLog("Task finished successfully.");
      } catch (countErr) {
        writeLog(`Warning: Failed to count lines: ${countErr.message}`);
        item.status = 1;
        await item.save();
      }

      logStream.end();
    });
  } catch (error) {
    writeLog(`Fatal Error: ${error.message}`);
    item.status = 3;
    item.log = error.message;
    await item.save();
    logStream.end();
  }
};

// Polling interval
setInterval(processQueue, 5000);
console.log("Suppression worker running...");
