const TestId = require("../models/TestId");
const { exec } = require("child_process");
const util = require("util");
const path = require("path");
const fs = require("fs");
const execPromise = util.promisify(exec);

/**
 * Parse inbox/spam count from the log file written by advance_imap/inbox.php & spam.php
 * Log lines look like:  "COUNT : 15 STORED INBOX 2024-01-01 10:00:00 am"
 *                        "COUNT : 7 STORED SPAM 2024-01-01 10:00:00 am"
 */
function parseCountsFromLog(logPath) {
  let inboxCount = 0;
  let spamCount = 0;
  try {
    if (!fs.existsSync(logPath)) return { inboxCount, spamCount };
    const content = fs.readFileSync(logPath, "utf8");
    const lines = content.split("\n");

    // Take the LATEST count from the log (don't sum them)
    for (const line of lines) {
      const inboxMatch = line.match(/COUNT\s*:\s*(\d+)\s+STORED\s+INBOX/i);
      if (inboxMatch) inboxCount = parseInt(inboxMatch[1], 10);

      const spamMatch = line.match(/COUNT\s*:\s*(\d+)\s+STORED\s+SPAM/i);
      if (spamMatch) spamCount = parseInt(spamMatch[1], 10);
    }
  } catch (e) {
    // ignore read errors
  }
  return { inboxCount, spamCount };
}

// @desc    Get all IMAP screens from the system
// @route   GET /api/imap-screens
const getImapScreens = async (req, res) => {
  try {
    let screenOutput = "";
    try {
      const { stdout } = await execPromise("sudo screen -ls");
      screenOutput = stdout;
    } catch (err) {
      screenOutput = err.stdout || "";
    }

    const lines = screenOutput.split("\n");
    const screenLines = lines.filter(
      (line) => line.includes("SPAM_") || line.includes("INBOX_"),
    );

    const imapScreens = [];

    for (const line of screenLines) {
      const part = line.trim().split("\t")[0];
      if (!part) continue;

      // ⚠️  Split only on FIRST dot — screen names CAN contain dots
      const firstDot = part.indexOf(".");
      if (firstDot === -1) continue;
      const pid = part.substring(0, firstDot);
      const fullName = part.substring(firstDot + 1);
      if (!fullName) continue;

      const type = fullName.includes("INBOX") ? "INBOX" : "SPAM";

      // Extract sno from screen name pattern: DOMAIN_emailuser_TYPE_sno
      // sno is the last segment after the last underscore
      const nameParts = fullName.split("_");
      const sno = nameParts[nameParts.length - 1];

      let cmdId = "---";
      let fullCommand = "---";

      try {
        // Search for the specific Node.js worker process
        const workerScript = "src/workers/imapMonitorWorker.js";
        const { stdout: psOut } = await execPromise(
          `sudo ps -ef | grep "node ${workerScript} ${sno} ${type}" | grep -v "grep" | head -1`,
        ).catch(() => ({ stdout: "" }));

        if (psOut.trim()) {
          const parts = psOut.trim().split(/\s+/);
          cmdId = parts[1]; // PID is second column
          fullCommand = parts.slice(7).join(" "); // The actual command string
        }
      } catch (e) {
        // ps might fail if screen/process is already gone
      }

      // Get metadata from MongoDB TestId
      let email = "---";
      let inboxCount = 0;
      let spamCount = 0;

      try {
        // Fetch all test IDs and find the one whose _id suffix matches sno
        const allTestIds = await TestId.find({});
        const testIdDoc = allTestIds.find(
          (t) => t._id.toString().slice(-4) === sno,
        );

        if (testIdDoc) {
          email = testIdDoc.email;
          // Read count from log file
          const logPath = path.join(
            __dirname,
            "../../advance_imap",
            `${email}.txt`,
          );
          const counts = parseCountsFromLog(logPath);
          inboxCount = counts.inboxCount;
          spamCount = counts.spamCount;
        }
      } catch (e) {
        // ignore lookup errors
      }

      imapScreens.push({
        _id: `${pid}_${fullName}`,
        screen_id: pid,
        screen_name: fullName,
        cmd_id: cmdId,
        command: fullCommand,
        datafile_name:
          type === "INBOX"
            ? testIdDoc?.filenameinbox || "---"
            : testIdDoc?.filenamespam || "---",
        email: email,
        type: type,
        inbox_count: inboxCount,
        spam_count: spamCount,
        count: type === "INBOX" ? inboxCount : spamCount,
        status: fullCommand !== "---" ? "active" : "inactive",
      });
    }

    res.json(imapScreens);
  } catch (error) {
    console.error("Error fetching IMAP screens:", error);
    res
      .status(500)
      .json({ message: "Error fetching IMAP screens", error: error.message });
  }
};

// @desc    Stop an IMAP screen (sends Ctrl+C to the process)
// @route   POST /api/imap-screens/stop/:name
const stopImapScreen = async (req, res) => {
  try {
    const { name } = req.params;
    await execPromise(`sudo screen -X -S ${name} stuff "^C"`);
    res.json({ message: `Screen ${name} stopped successfully` });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error stopping IMAP screen", error: error.message });
  }
};

// @desc    Delete/Quit an IMAP screen
// @route   DELETE /api/imap-screens/:name
const deleteImapScreen = async (req, res) => {
  try {
    const { name } = req.params;
    await execPromise(`sudo screen -XS ${name} quit`);
    res.json({ message: `Screen ${name} deleted successfully` });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting IMAP screen", error: error.message });
  }
};

// @desc    Get logs for an IMAP screen (reads the email.txt log file)
// @route   GET /api/imap-screens/logs/:name
const getImapLogs = async (req, res) => {
  try {
    const { name } = req.params;
    // name is the email (e.g. ronnyzim44@yahoo.com.txt  or  ronnyzim44@yahoo.com)
    const logFile = name.endsWith(".txt") ? name : `${name}.txt`;
    const logPath = path.join(__dirname, "../../advance_imap", logFile);

    if (!fs.existsSync(logPath)) {
      return res.json({
        logs: "Log file not found. Screen may not have started writing yet.",
      });
    }

    // Read last 200 lines (equivalent to `tac | head -100` but simpler)
    const content = fs.readFileSync(logPath, "utf8");
    const lines = content.split("\n").filter(Boolean);
    const last200 = lines.slice(-200).join("\n");
    res.json({ logs: last200 });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching logs", error: error.message });
  }
};

// @desc    Start/Create new IMAP screens for a test ID
// @route   POST /api/imap-screens/create
const createImapScreen = async (req, res) => {
  try {
    const { sno } = req.body;
    if (!sno)
      return res.status(400).json({ message: "Test ID (_id) is required" });

    // Fetch Test ID from MongoDB
    const testIdDoc = await TestId.findById(sno).catch(() => null);

    if (!testIdDoc)
      return res.status(404).json({ message: "Test ID not found in DB" });

    const email = testIdDoc.email;
    const domain = (testIdDoc.domain || "IMAP").toUpperCase();

    // Sanitize helper: strip .php extension. Dots are now safe in screen names.
    // Screen names MUST NOT contain dots — the `screen -ls` output format is
    // "PID.screen_name" so any dot inside the name breaks parsing (and STOP/DELETE).
    const sanitize = (str) => (str || "").replace(/\.php$/i, ""); // remove trailing .php (dots are safe now)

    const inboxBase = sanitize(testIdDoc.filenameinbox || `${domain}_INBOX`);
    const spamBase = sanitize(testIdDoc.filenamespam || `${domain}_SPAM`);

    // Use current working directory (usually the project root)
    const rootDir = path.resolve(__dirname, "../../");
    const imapDir = path.join(rootDir, "advance_imap");
    const workerScript = path.join(rootDir, "src/workers/imapMonitorWorker.js");

    // Append the MongoDB _id short suffix so names are unique across re-runs
    const shortId = testIdDoc._id.toString().slice(-4);
    const sinboxname = `${inboxBase}_${shortId}`;
    const sspamname = `${spamBase}_${shortId}`;

    const imapDir = path.resolve(__dirname, "../../advance_imap");
    const logFile = path.join(imapDir, `${email}.txt`);

    // Clean up old log file
    try {
      fs.unlinkSync(logFile);
    } catch (e) {
      /* ignore */
    }

    const commands = [
      `sudo screen -dmS "${sinboxname}" && sudo screen -S "${sinboxname}" -X stuff "cd ${rootDir} && node ${workerScript} ${shortId} INBOX\\n"`,
      `sudo screen -dmS "${sspamname}" && sudo screen -S "${sspamname}" -X stuff "cd ${rootDir} && node ${workerScript} ${shortId} SPAM\\n"`,
    ];

    const results = [];
    for (const cmd of commands) {
      try {
        await execPromise(cmd);
        results.push({ cmd, status: "ok" });
      } catch (e) {
        results.push({ cmd, status: "error", error: e.message });
      }
    }

    res.json({
      message: "IMAP screens started successfully.",
      email,
      sinboxname,
      sspamname,
      results,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating IMAP screens", error: error.message });
  }
};

// @desc    Restart an IMAP screen (stuff the command again if it stopped)
// @route   POST /api/imap-screens/restart
const restartImapScreen = async (req, res) => {
  try {
    const { name, type, sno } = req.body;
    if (!name || !type || !sno)
      return res.status(400).json({ message: "Missing params" });

    const rootDir = path.resolve(__dirname, "../../");
    const workerScript = path.join(rootDir, "src/workers/imapMonitorWorker.js");

    // Stuff the command into the existing screen
    await execPromise(
      `sudo screen -S "${name}" -X stuff "cd ${rootDir} && node ${workerScript} ${sno} ${type}\\n"`,
    );

    res.json({ message: `Screen ${name} restarted successfully` });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error restarting screen", error: error.message });
  }
};

module.exports = {
  getImapScreens,
  stopImapScreen,
  deleteImapScreen,
  getImapLogs,
  createImapScreen,
  restartImapScreen,
};
