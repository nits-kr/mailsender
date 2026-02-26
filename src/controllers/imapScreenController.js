const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);
const mysql = require("../config/mysql");

// @desc    Get all IMAP screens from the system
// @route   GET /api/imap-screens
const getImapScreens = async (req, res) => {
  try {
    // 1. Get screen list from system
    let screenOutput = "";
    try {
      const { stdout } = await execPromise("sudo screen -ls");
      screenOutput = stdout;
    } catch (err) {
      // screen -ls returns non-zero if no screens are found
      screenOutput = err.stdout || "";
    }

    // Filter for our specific imap screens (matching PHP logic)
    const lines = screenOutput.split("\n");
    const screenLines = lines.filter(
      (line) => line.includes("SPAM_") || line.includes("INBOX_"),
    );

    const imapScreens = [];

    for (const line of screenLines) {
      // Format: \tPID.NAME\t(Detached/Attached)
      const part = line.trim().split("\t")[0];
      if (!part) continue;

      const pid = part.split(".")[0];
      const fullName = part.split(".")[1];
      if (!fullName) continue;

      // Parse screen name to get SNO (test ID)
      // Example: INBOX_test_SNO.php
      const nameParts = fullName.split("_");
      const snoWithExt = nameParts[nameParts.length - 1]; // e.g. "30.php"
      const sno = snoWithExt.split(".")[0];
      const type = fullName.includes("INBOX") ? "INBOX" : "SPAM";

      // 2. Get CMD Id and Command details using ps
      let cmdId = "---";
      let fullCommand = "---";
      try {
        const { stdout: psOut } = await execPromise(
          `sudo ps -el | grep "${pid}" | grep -v 'grep' | awk '{print $4}'`,
        );
        cmdId = psOut.trim();
        if (cmdId) {
          const { stdout: commandOut } = await execPromise(
            `sudo ps -ef | grep "${cmdId}" | grep -v 'bash\\|grep' | awk -F ':' '{print ":"\$4}' | sed 's|:[0-9][0-9] ||g'`,
          );
          fullCommand = commandOut.trim() || "---";
        }
      } catch (e) {
        // ps might fail if screen is gone
      }

      // 3. Get Metadata from MySQL (testids and counts)
      let email = "---";
      let count = 0;

      if (!isNaN(parseInt(sno))) {
        const [testIdRows] = await mysql.execute(
          "SELECT email FROM admin.testids WHERE sno = ?",
          [sno],
        );
        if (testIdRows.length > 0) {
          email = testIdRows[0].email;

          try {
            const countQuery = `SELECT count(*) as count FROM imap_data_new.\`${email}\` WHERE status = ?`;
            const [countRows] = await mysql.execute(countQuery, [type]);
            count = countRows[0]?.count || 0;
          } catch (err) {
            // Table might not exist yet
            count = 0;
          }
        }
      }

      imapScreens.push({
        _id: pid,
        screen_id: pid,
        screen_name: fullName,
        cmd_id: cmdId,
        command: fullCommand,
        datafile_name: email,
        count: count,
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

// @desc    Stop an IMAP screen (stuff control-c)
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

// @desc    Get logs for an IMAP screen
// @route   GET /api/imap-screens/logs/:name
const getImapLogs = async (req, res) => {
  try {
    const { name } = req.params; // This will be the email.txt filename
    const logPath = `/var/www/html/advance_imap/${name}`;
    const { stdout } = await execPromise(`tac ${logPath} | head -100`);
    res.json({ logs: stdout });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching logs", error: error.message });
  }
};

// @desc    Start/Create new IMAP screens
// @route   POST /api/imap-screens/create
const createImapScreen = async (req, res) => {
  try {
    const { sno } = req.body;
    if (!sno)
      return res.status(400).json({ message: "Test ID (sno) is required" });

    // Fetch Test ID details
    const [rows] = await mysql.execute(
      "SELECT * FROM admin.testids WHERE sno = ?",
      [sno],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Test ID not found" });

    const testId = rows[0];
    const email = testId.email;

    // Side effects matching legacy
    await mysql.execute(`TRUNCATE TABLE imap_data_new.\`${email}\``);
    await execPromise(`rm -rf /var/www/html/advance_imap/${email}.txt`);

    // Calculate screen names
    const inboxBase = testId.filenameinbox.split(".")[0];
    const spamBase = testId.filenamespam.split(".")[0];
    const sinboxname = `${inboxBase}_${sno}`;
    const sspamname = `${spamBase}_${sno}`;

    // Commands to start screening
    const commands = [
      `sudo screen -dmS ${sinboxname}.php && sudo screen -S ${sinboxname}.php -X stuff "cd /var/www/html/advance_imap/ ;php /var/www/html/advance_imap/inbox.php ${sno}\n"`,
      `sudo screen -dmS ${sspamname}.php && sudo screen -S ${sspamname}.php -X stuff "cd /var/www/html/advance_imap/ ;php /var/www/html/advance_imap/spam.php ${sno}\n"`,
    ];

    // Execute commands immediately
    for (const cmd of commands) {
      await execPromise(cmd);
    }

    res.json({
      message: "IMAP screens started successfully.",
      commands: commands,
      email: email,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating IMAP screens", error: error.message });
  }
};

module.exports = {
  getImapScreens,
  stopImapScreen,
  deleteImapScreen,
  getImapLogs,
  createImapScreen,
};
