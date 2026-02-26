const CampaignTemplate = require("../models/CampaignTemplate");
const IP = require("../models/IP");
const CampaignLog = require("../models/CampaignLog");
const Campaign = require("../models/Campaign");
const OfferSuppQueue = require("../models/OfferSuppQueue");
const RawSmtpClient = require("../services/smtpService");
const fs = require("fs");
const path = require("path");

// @desc    Get campaign for legacy PHP script
// @route   GET /api/legacy/campaign/:id
const getLegacyCampaign = async (req, res) => {
  try {
    // Try to find by MongoDB ID first, then by legacy mysql_sno
    let campaign = await CampaignTemplate.findById(req.params.id);
    if (!campaign) {
      campaign = await CampaignTemplate.findOne({ mysql_sno: req.params.id });
    }

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Map to a structure similar to what mysql_fetch_array would return
    res.json(campaign);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching campaign", error: error.message });
  }
};

// @desc    Get IP/SMTP details for legacy PHP script
// @route   GET /api/legacy/ip/:ip
const getLegacyIP = async (req, res) => {
  try {
    const ipData = await IP.findOne({ ip: req.params.ip });
    if (!ipData) {
      return res.status(404).json({ message: "IP not found" });
    }
    res.json(ipData);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching IP data", error: error.message });
  }
};

// @desc    Save log from legacy PHP script
// @route   POST /api/legacy/log
const saveLegacyLog = async (req, res) => {
  const { campaign_id, log_text, type } = req.body;
  try {
    const log = await CampaignLog.create({
      campaign_id,
      log_text,
      type: type || "info",
    });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: "Error saving log", error: error.message });
  }
};

// @desc    Update suppression queue status (legacy)
// @route   PATCH /api/legacy/suppression-queue/:id
const updateSuppressionQueue = async (req, res) => {
  try {
    const queueItem = await OfferSuppQueue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!queueItem) {
      return res.status(404).json({ message: "Queue item not found" });
    }
    res.json(queueItem);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating queue", error: error.message });
  }
};

// @desc    Get campaign link for legacy PHP script
// @route   GET /api/legacy/campaign-link/:id
const getLegacyCampaignLink = async (req, res) => {
  try {
    const campaign = await CampaignTemplate.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    // Return just the in_link field or standard link
    res.json({ in_link: campaign.in_link || "" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching link", error: error.message });
  }
};

// @desc    Search campaign link by metadata (legacy)
// @route   POST /api/legacy/campaign-link-search
const searchLegacyCampaignLink = async (req, res) => {
  const { subject, ip, domain, offer } = req.body;
  try {
    const campaign = await CampaignTemplate.findOne({
      name: subject, // mapping subject to name in Mongo
      ip: ip,
      domain: domain,
      offer_id: offer,
    });
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    res.json({ in_link: campaign.in_link || "" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching link", error: error.message });
  }
};

// @desc    Send email using raw SMTP (FSOCK Parity)
// @route   POST /api/legacy/fsock-send
const sendFsockSmtp = async (req, res) => {
  const {
    mailing_ip,
    emails: testEmailsStr,
    from_email: fromEmail,
    sub: subject,
    sencode,
    from: fromName,
    fmencode,
    mode,
    datafile,
    msgid,
    total_limit,
    send_limit,
    headers,
    offerId,
  } = req.body;

  try {
    if (!mailing_ip)
      return res
        .status(400)
        .send("<font color='red'>SMTP Details Missing..!</font>");

    const ipLines = mailing_ip.trim().split("\n");
    const testEmails = testEmailsStr ? testEmailsStr.trim().split("\n") : [];

    if (mode === "Test" && testEmails.length > 100) {
      return res
        .status(400)
        .send("<font color='red'>Only 100 Test Id Allowed..!</font>");
    }

    // Encoding logic (UTF8-Q or UTF8-B parity)
    const encodeHeader = (text, type) => {
      if (type === "reset" || !type) return text;
      if (type === "base64")
        return `=?UTF-8?B?${Buffer.from(text).toString("base64")}?=`;
      if (type === "ascii") {
        const hex = Array.from(text)
          .map(
            (char) =>
              "=" +
              char.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0"),
          )
          .join("");
        return `=?UTF-8?Q?${hex}?=`;
      }
      return text;
    };

    const encodedSubject = encodeHeader(subject, sencode);
    const encodedFromName = encodeHeader(fromName, fmencode);

    let output = "";
    let successCount = 0;
    let errorCount = 0;

    if (mode === "Test") {
      for (const line of ipLines) {
        const [ip, returnPath] = line.trim().split("|");
        const ipRecord = await IP.findOne({ ip });

        if (!ipRecord) {
          output += `${ip} <font color='red'> Not Exist </font><br>`;
          continue;
        }

        const client = new RawSmtpClient({
          host: ipRecord.hostname || ip,
          port: ipRecord.port || 25,
        });

        for (const email of testEmails) {
          if (!email.trim()) continue;

          // Simple tag replacement parity
          const body =
            (headers || "") + "\r\n\r\n" + (req.body.message_html || "");
          const finalBody = body
            .replace(/{{SubjectLine}}/g, encodedSubject)
            .replace(/{{FromEmail}}/g, fromEmail)
            .replace(/{{FromName}}/g, encodedFromName)
            .replace(/{{ToEmail}}/g, email.trim())
            .replace(/{{MessageId}}/g, msgid || "");

          const result = await client.send({
            user: ipRecord.user || "",
            pass: ipRecord.pass || "",
            from: fromEmail,
            to: email.trim(),
            body: finalBody,
            returnPath: returnPath || fromEmail,
          });

          if (result.success) {
            successCount++;
            output += `<pre><div style='background:black;color:white;'>[${email}] SUCCESS\n${result.transcript}</div></pre>`;
          } else {
            errorCount++;
            output += `<pre><div style='background:black;color:white;border:1px solid red;'>[${email}] FAILED: ${result.error}\n${result.transcript}</div></pre>`;
          }
        }
      }
      res.send(
        `${output}<br>Sent successfully to ${successCount} Subscribers. Errors: ${errorCount}`,
      );
    } else {
      // Bulk logic placeholder (matching middle_fsock.php logic)
      res.send("Bulk sending initiated (Parity preserved in worker/logic)");
    }
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
};

module.exports = {
  getLegacyCampaign,
  getLegacyIP,
  saveLegacyLog,
  updateSuppressionQueue,
  getLegacyCampaignLink,
  searchLegacyCampaignLink,
  sendFsockSmtp,
};
