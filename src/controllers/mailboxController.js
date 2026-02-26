const mysql = require("../config/mysql");

// @desc    Get all email tables from imap_data_new database
// @route   GET /api/mailbox/emails
const getMailboxEmails = async (req, res) => {
  try {
    const [rows] = await mysql.execute("SHOW TABLES FROM imap_data_new");
    const emails = rows.map((row) => Object.values(row)[0]);
    res.json(emails);
  } catch (error) {
    console.error("Error fetching mailbox emails:", error);
    res
      .status(500)
      .json({ message: "Error fetching mailbox emails", error: error.message });
  }
};

// @desc    Get mailbox data for a specific email table
// @route   GET /api/mailbox/data/:email
const getMailboxData = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ message: "Email table name is required" });
    }

    // Matching legacy logic: order by sno desc limit 1000
    const query = `SELECT * FROM imap_data_new.\`${email}\` ORDER BY sno DESC LIMIT 1000`;
    const [rows] = await mysql.execute(query);

    const formattedData = rows.map((row) => {
      // Decode base64 fields as per legacy imaplog.php
      let subject = "---";
      let fromField = "---";
      let toField = "---";

      try {
        if (row.subject)
          subject = Buffer.from(row.subject, "base64").toString("utf8");
        if (row.from)
          fromField = Buffer.from(row.from, "base64").toString("utf8");
        if (row.to) toField = Buffer.from(row.to, "base64").toString("utf8");
      } catch (e) {
        console.error("Error decoding base64 fields for sno:", row.sno, e);
      }

      // Format message ID (remove < and >)
      let messageId = row.message_id || "";
      messageId = messageId.replace(/<|>/g, "");

      return {
        sno: row.sno,
        last_update_time: row.last_update_time,
        subject,
        from: fromField,
        to: toField,
        status: row.status,
        ip: row.ip,
        message_id: messageId,
      };
    });

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching mailbox data:", error);
    res
      .status(500)
      .json({ message: "Error fetching mailbox data", error: error.message });
  }
};

module.exports = {
  getMailboxEmails,
  getMailboxData,
};
