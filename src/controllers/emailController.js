const { emailQueue } = require("../queues/emailQueue");
const Log = require("../models/Log");
const Campaign = require("../models/Campaign");
const CampaignLog = require("../models/CampaignLog");
const crypto = require("crypto");
const pool = require("../config/mysql");

const sendEmail = async (req, res) => {
  const {
    from_email,
    from_name,
    mailing_ip,
    headers,
    subject,
    message_html,
    message_plain,
    emails,
    mode,
    subject_enc,
    from_enc,
    msg_type,
    charset,
    encoding,
    charset_alt,
    encoding_alt,
    sen_t,
    offer_id,
    template_name,
    domain,
    message_id: manualMsgId,
    reply_to,
    xmailer,
    total_send,
    data_file,
  } = req.body;

  try {
    const ipLines = mailing_ip.split("\n").filter((l) => l.trim());
    const targetEmails = emails.split("\n").filter((e) => e.trim());

    // Create a campaign record for tracking
    const campaign = await Campaign.create({
      template_name: template_name || "Manual Sending",
      offer_id: offer_id || "Manual",
      server: ipLines[0] || "Unknown",
      data_file: data_file || "Manual",
      total_emails: targetEmails.length,
      status: "Running",
    });

    await CampaignLog.create({
      campaign_id: campaign._id,
      log_text: `Campaign started with ${targetEmails.length} emails.`,
      type: "info",
    });

    // Create a log entry for dashboard
    await Log.create({
      mailer: "Admin",
      template_id: template_name || "Manual",
      interface: mode === "bulk" ? "FSOCK SEND SMTP AUTO" : "NEW INTERFACE",
      server: ipLines[0] || "Unknown",
      offer_id: offer_id || "Manual",
      domain: domain || from_email.split("@")[1] || "Unknown",
      from: from_email,
      test_sent: mode === "test" ? targetEmails.length : 0,
      bulk_test_sent: mode === "bulk" ? targetEmails.length : 0,
      bulk_test: mode === "bulk" ? targetEmails.length : 0,
      error: 0,
    });

    let ipIndex = 0;
    for (const email of targetEmails) {
      const currentIp = ipLines[ipIndex % ipLines.length].trim();
      ipIndex++;

      const dateNow = new Date();
      const dateStr = dateNow.toLocaleDateString("en-GB").replace(/\//g, "-");
      const datetimeStr = dateNow.toUTCString();
      const msgId =
        manualMsgId ||
        `<${crypto.randomBytes(16).toString("hex")}@${domain || "localhost"}>`;

      const emailDomain = email.split("@")[1] || "";
      const nameTag = emailDomain.replace(/[._-]/g, "").replace(/[0-9]/g, "");

      const replaceTags = (text) => {
        if (!text) return "";
        return text
          .replace(/{email}/g, email)
          .replace(/{name}/g, nameTag)
          .replace(/{fromid}/g, from_email)
          .replace(/{fromname}/g, from_name)
          .replace(/{datetime}/g, datetimeStr)
          .replace(/{date}/g, dateStr)
          .replace(/{msgid}/g, msgId)
          .replace(/{domain}/g, domain || "")
          .replace(
            /{unsl}/g,
            `http://${domain || "localhost"}/un.php?${offer_id || "0"}|${email}`,
          )
          .replace(
            /{base_trk}/g,
            Buffer.from(`${offer_id || "0"}|${email}`).toString("base64"),
          )
          .replace(
            /{hex_trk}/g,
            Buffer.from(`${offer_id || "0"}|${email}`).toString("hex"),
          );
      };

      await emailQueue.add("send-email", {
        campaign_id: campaign._id, // Pass campaign ID to worker
        from_email,
        from_name: replaceTags(from_name),
        mailing_ip: currentIp,
        headers: replaceTags(headers),
        subject: replaceTags(subject),
        body_html: replaceTags(message_html),
        body_plain: replaceTags(message_plain),
        email: email.trim(),
        mode,
        subject_enc,
        from_enc,
        msg_type,
        charset,
        encoding,
        charset_alt,
        encoding_alt,
        msgId,
        reply_to,
        xmailer,
      });
    }

    res.json({
      message: "Jobs queued successfully",
      count: targetEmails.length,
      campaign_id: campaign._id,
    });
  } catch (error) {
    console.error("Error queueing emails", error);
    res
      .status(500)
      .json({ message: "Error queueing emails", error: error.message });
  }
};

const getDefaultIps = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT assignedip as ip FROM svml.mumara");
    const ips = rows.map((r) => r.ip).join("\n");
    res.json({ ips });
  } catch (error) {
    console.error("Error fetching default IPs from MySQL", error);
    res
      .status(500)
      .json({ message: "Error fetching default IPs", error: error.message });
  }
};

const getCampaigns = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT MAX(sno) as sno, tempname as name FROM svml.svml_sendgrid WHERE status = '1' GROUP BY tempname ORDER BY tempname ASC",
    );
    res.json(rows.map((r) => ({ id: r.sno, name: r.name })));
  } catch (error) {
    console.error("Error fetching campaigns from MySQL", error);
    res
      .status(500)
      .json({ message: "Error fetching campaigns", error: error.message });
  }
};

const getCampaignDetails = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM svml.svml_sendgrid WHERE sno = ?",
      [req.params.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const c = rows[0];

    // Map 100% of legacy fields to the expected frontend structure
    const mappedData = {
      // Main Headers & Content
      accs: c.mutidomains || "",
      headers: c.headers
        ? Buffer.from(c.headers, "base64").toString("utf8")
        : "",
      from_email: c.ip || "",
      subject: c.subject || "",
      from_name: c.from_val || "",
      emails: c.emails || "",
      msg_type: c.type || "html",
      message_html: c.msg || "",
      message_plain: c.textm || "",
      search_replace: c.reason
        ? Buffer.from(c.reason, "base64").toString("utf8")
        : "",

      // Settings Grid
      data_file: c.data || "",
      total_send: String(c.limits || ""),
      limit_to_send: c.limit_to_send || "",
      sleep_time: c.sleep_time || "",
      offer_id: c.offer || "",
      template_name: c.tempname || "",
      domain: c.domain || "",
      wait_time: String(c.wait || "2"),
      message_id: c.bcc || "",
      inb_pattern: c.inbpatt || "1",
      restart_choice: c.res_choice || "YES",
      script_choice: c.head || "", // 'head' column maps to 'mail_ch' input
      relay_percent: c.relay_per || "",
      inbox_percent: c.oid || "",
      times_to_send: String(c.times || "1"),
      mail_after: c.pwd || "", // 'pwd' column maps to 'mail_per' input
      reply_to: c.reply_to || "0",
      xmailer: c.xmailer || "0",
      interval_time: String(c.interval_time || ""),

      // Charsets / Encodings
      charset: c.charen || "UTF-8",
      encoding: c.contend || "8bit",
      charset_alt: c.charen_alt || "UTF-8",
      encoding_alt: c.contend_alt || "8bit",

      // Modes
      mode: c.mode || "test",
      sen_t: c.sen_t || "manual",
    };

    res.json(mappedData);
  } catch (error) {
    console.error("Error fetching campaign details from MySQL", error);
    res.status(500).json({
      message: "Error fetching campaign details",
      error: error.message,
    });
  }
};

module.exports = {
  sendEmail,
  getCampaigns,
  getCampaignDetails,
  getDefaultIps,
};
