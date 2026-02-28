const { emailQueue } = require("../queues/emailQueue");
const Log = require("../models/Log");
const Campaign = require("../models/Campaign");
const CampaignLog = require("../models/CampaignLog");
const crypto = require("crypto");

const CampaignTemplate = require("../models/CampaignTemplate");
const IP = require("../models/IP");
const Offer = require("../models/Offer");
const { generateMessageId } = require("../utils/patternGenerator");
const TagEngine = require("../utils/tagEngine");
const ReputationScore = require("../models/ReputationScore");

const applySearchReplace = (text, searchReplaceStr) => {
  if (!text || !searchReplaceStr) return text;
  let result = text;
  const pairs = searchReplaceStr.split("\n");
  for (const pair of pairs) {
    const [search, replace] = pair.split("|");
    if (search && replace) {
      try {
        // Escape search for literal replacement
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escapedSearch, "g");
        result = result.replace(regex, replace);
      } catch (e) {
        console.error("Search/Replace Regex Error:", e);
      }
    }
  }
  return result;
};

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
    search_replace,
    min_inb_score, // Added optional threshold
  } = req.body;

  try {
    // -------------------------------------------------------------------------
    // Inbox Intelligence Engine: Reputation Guard
    // -------------------------------------------------------------------------
    const ipLines = mailing_ip.split("\n").filter((l) => l.trim());
    const primaryIp = ipLines[0] ? ipLines[0].split("|")[0].trim() : null;

    if (primaryIp) {
      const rep = await ReputationScore.findOne({ assetValue: primaryIp });
      if (rep && (rep.status === "paused" || rep.status === "risky")) {
        return res.status(403).json({
          message: `Send Blocked: IP ${primaryIp} has a ${rep.status} reputation score (${rep.inboxScore}%). Check Intelligence Dashboard.`,
        });
      }
    }

    if (domain) {
      const domRep = await ReputationScore.findOne({ assetValue: domain });
      if (domRep && domRep.status === "paused") {
        return res.status(403).json({
          message: `Send Blocked: Domain ${domain} is currently paused due to low inbox placement. Check Intelligence Dashboard.`,
        });
      }
    }
    // -------------------------------------------------------------------------
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
        (inb_pattern && inb_pattern !== "0" && inb_pattern !== "1"
          ? generateMessageId(inb_pattern, domain || "localhost")
          : `<${crypto.randomBytes(16).toString("hex")}@${domain || "localhost"}>`);

      const emailDomain = email.split("@")[1] || "";
      const nameTag = emailDomain.replace(/[._-]/g, "").replace(/[0-9]/g, "");

      const replaceTags = (text) => {
        if (!text) return "";
        let processed = text
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
            /{ourl}/g,
            `http://${domain || "localhost"}/un.php?${offer_id || "0"}|${email}`,
          )
          .replace(
            /{oln}/g,
            `http://${domain || "localhost"}/un.php?${offer_id || "0"}|${email}`,
          )
          .replace(
            /{base_trk}/g,
            Buffer.from(`${offer_id || "0"}|${email}`).toString("base64"),
          )
          .replace(
            /{hex_trk}/g,
            Buffer.from(`${offer_id || "0"}|${email}`).toString("hex"),
          )
          .replace(
            /\(\(_track_\)\)/g,
            crypto.createHash("md5").update(email).digest("hex"),
          );

        // Apply TagEngine for functions like [[num(10)]]
        processed = TagEngine.process(processed, { email, domain, offer_id });

        // Apply search/replace logic (PHP parity)
        processed = applySearchReplace(processed, search_replace);

        return processed;
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

    let commandGuidance = "";
    if (mode === "bulk" || sen_t === "auto") {
      commandGuidance = `To Run In Screen Use Below Command:\nphp send_mul_phpm.php ${campaign._id}`;
    }

    res.json({
      message: "Jobs queued successfully",
      count: targetEmails.length,
      campaign_id: campaign._id,
      guidance: commandGuidance,
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
    const rows = await IP.find({ status: "active" });
    const ips = rows.map((r) => r.ip).join("\n");
    res.json({ ips });
  } catch (error) {
    console.error("Error fetching default IPs from MongoDB", error);
    res.status(500).json({
      message: "Error fetching default IPs",
      error: error.message || "Unknown error",
    });
  }
};

const getCampaigns = async (req, res) => {
  try {
    const rows = await CampaignTemplate.find({}).sort({ name: 1 });
    res.json(rows.map((r) => ({ id: r._id, name: r.name })));
  } catch (error) {
    console.error("Error fetching campaigns from MongoDB", error);
    res.status(500).json({
      message: "Error fetching campaigns",
      error: error.message || "Unknown error",
    });
  }
};

const getCampaignDetails = async (req, res) => {
  try {
    const c = await CampaignTemplate.findById(req.params.id);

    if (!c) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Map fields to the expected frontend structure
    const mappedData = {
      // Main Headers & Content
      accs: c.accs || "",
      headers: c.headers || "",
      from_email: c.from_email || "",
      subject: c.subject || "",
      from_name: c.from_name || "",
      emails: c.emails || "",
      msg_type: c.msg_type || "html",
      message_html: c.message_html || "",
      message_plain: c.message_plain || "",
      search_replace: c.search_replace || "",

      // Settings Grid
      data_file: c.data_file || "",
      total_send: String(c.total_send || ""),
      limit_to_send: c.limit_to_send || "",
      sleep_time: c.sleep_time || "",
      offer_id: c.offer_id || "",
      template_name: c.name || "",
      domain: c.domain || "",
      wait_time: String(c.wait_time || "2"),
      message_id: c.message_id || "",
      inb_pattern: c.inb_pattern || "1",
      restart_choice: c.restart_choice || "YES",
      script_choice: c.script_choice || "",
      relay_percent: c.relay_percent || "",
      inbox_percent: c.inbox_percent || "",
      times_to_send: String(c.times_to_send || "1"),
      mail_after: c.mail_after || "",
      reply_to: c.reply_to || "0",
      xmailer: c.xmailer || "0",
      interval_time: String(c.interval_time || ""),

      // Charsets / Encodings
      charset: c.charset || "UTF-8",
      encoding: c.encoding || "8bit",
      charset_alt: c.charset_alt || "UTF-8",
      encoding_alt: c.encoding_alt || "8bit",

      // Modes
      mode: c.mode || "test",
      sen_t: c.sen_t || "manual",
      status: c.status || "0",
    };

    res.json(mappedData);
  } catch (error) {
    console.error("Error fetching campaign details from MongoDB", error);
    res.status(500).json({
      message: "Error fetching campaign details",
      error: error.message,
    });
  }
};

const getCampaignLogs = async (req, res) => {
  try {
    const logs = await CampaignLog.find({ campaign_id: req.params.campaignId })
      .sort({ created_at: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching campaign logs", error);
    res
      .status(500)
      .json({ message: "Error fetching logs", error: error.message });
  }
};

const getInboxPatterns = async (req, res) => {
  try {
    // Generate list of 24 patterns
    const patterns = Array.from({ length: 24 }, (_, i) => ({
      id: i + 1,
      name: `pattern ${i + 1}`,
    }));
    res.json(patterns);
  } catch (error) {
    res.status(500).json({ message: "Error fetching patterns" });
  }
};

const validateOffer = async (req, res) => {
  try {
    const offer = await Offer.findOne({ offer_id: req.params.offerId });
    if (offer) {
      res.json({ valid: true, offer_id: offer.offer_id });
    } else {
      res.json({ valid: false });
    }
  } catch (error) {
    res.status(500).json({ message: "Error validating offer" });
  }
};

module.exports = {
  sendEmail,
  getCampaigns,
  getCampaignDetails,
  getDefaultIps,
  getCampaignLogs,
  getInboxPatterns,
  validateOffer,
};
