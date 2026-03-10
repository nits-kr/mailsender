const CampaignTemplate = require("../models/CampaignTemplate");
const IP = require("../models/IP");
const CampaignLog = require("../models/CampaignLog");
const Campaign = require("../models/Campaign");
const OfferSuppQueue = require("../models/OfferSuppQueue");
const SmtpDetail = require("../models/SmtpDetail");
const RawSmtpClient = require("../services/smtpService");
const TagEngine = require("../utils/tagEngine");
const fs = require("fs");
const path = require("path");

// @desc    Get campaign for legacy PHP script
// @route   GET /api/legacy/campaign/:id
const getLegacyCampaign = async (req, res) => {
  try {
    // Try to find by MongoDB ID
    const campaign = await CampaignTemplate.findById(req.params.id);

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
    let ipData = await IP.findOne({ ip: req.params.ip });
    if (!ipData) {
      const sd = await SmtpDetail.findOne({
        $or: [{ assignedip: req.params.ip }, { server: req.params.ip }],
      });
      if (sd) {
        ipData = {
          ip: sd.assignedip,
          hostname: sd.hostname || sd.server,
          user: sd.user,
          pass: sd.pass,
          port: Number(sd.port) || 587,
          tls: sd.tls,
        };
      }
    }
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

const TagEngine = require("../utils/tagEngine");

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
    domain,
    message_html: messageHtml,
    message_plain: messagePlain,
    sleep,
    wait,
    inbox_percentage,
    test_after,
  } = req.body;

  try {
    if (!mailing_ip)
      return res
        .status(400)
        .send("<font color='red'>SMTP Details Missing..!</font>");

    // 1. Generate SVML ID (Campaign ID) by creating a template record
    const campaign = await CampaignTemplate.create({
      name: subject || "FSock Manual Send",
      from_email: fromEmail,
      subject: subject,
      from_name: fromName,
      message_html: messageHtml,
      message_plain: messagePlain,
      headers: headers,
      offer_id: offerId,
      domain: domain,
      mode: mode || "Test",
      sleep_time: sleep,
      wait_time: wait,
      inbox_percent: inbox_percentage,
      mail_after: test_after,
    });

    const svmlId = campaign._id;
    const ipLines = mailing_ip.trim().split("\n");
    const testEmails = testEmailsStr ? testEmailsStr.trim().split("\n") : [];

    if (mode === "Test" && testEmails.length > 100) {
      return res
        .status(400)
        .send("<font color='red'>Only 100 Test Id Allowed..!</font>");
    }

    // Encoding logic (UTF8-Q or UTF8-B parity)
    const encodeHeader = (text, type) => {
      if (!text || type === "reset" || !type) return text;
      if (type === "base64")
        return `=?UTF-8?B?${Buffer.from(text).toString("base64")}?=`;
      if (type === "ascii") {
        return `=?UTF-8?Q?${TagEngine.functions.ascii2hex(text)}?=`;
      }
      return text;
    };

    const encodedSubject = encodeHeader(subject, sencode);
    const encodedFromName = encodeHeader(fromName, fmencode);

    let output = `<div style='color: green; font-weight: bold; margin-bottom: 10px;'>Campaign Created Successfully. SVML ID is ${svmlId}</div>`;
    let successCount = 0;
    let errorCount = 0;

    if (mode === "Test") {
      for (const line of ipLines) {
        const [ip, returnPath] = line.trim().split("|");
        let ipRecord = await IP.findOne({ ip });

        if (!ipRecord) {
          // Fallback to SmtpDetail (AliSing07 etc)
          const sd = await SmtpDetail.findOne({
            $or: [{ assignedip: ip }, { server: ip }],
          });
          if (sd) {
            ipRecord = {
              ip: sd.assignedip,
              hostname: sd.hostname || sd.server,
              port: Number(sd.port) || 587,
              user: sd.user,
              pass: sd.pass,
              tls: sd.tls,
            };
          }
        }

        if (!ipRecord) {
          output += `${ip} <font color='red'> Not Exist </font><br>`;
          continue;
        }

        const client = new RawSmtpClient({
          host: ipRecord.hostname || ipRecord.ip || ip,
          port: ipRecord.port || 25,
        });

        for (const email of testEmails) {
          const targetEmail = email.trim();
          if (!targetEmail) continue;

          // 1. Initial MsgId Pre-Processing (Functions [[num]] and {{Domain}})
          let processedMsgId = TagEngine.process(msgid || "").replace(
            /{{Domain}}/g,
            domain || "",
          );

          // 2. Build full context for subsequent template tags
          const context = {
            email: targetEmail,
            fromEmail,
            fromName: encodedFromName,
            subject: encodedSubject,
            msgId: processedMsgId || "", // For TagEngine consistency
          };

          const [toName, toDomain] = targetEmail.split("@");
          const fromDomain = fromEmail.split("@")[1] || "";

          // Process Body/Headers with TagEngine and Logic
          // Initialized below with default headers if empty

          // 3. Basic Tag Replacements (Strings)
          const replaceBaseTags = (str) => {
            if (!str) return "";
            return str
              .replace(/{{SubjectLine}}/g, encodedSubject)
              .replace(/{{FromEmail}}/g, fromEmail)
              .replace(/{{FromName}}/g, encodedFromName)
              .replace(/{{FromDomain}}/g, fromDomain)
              .replace(/{{Domain}}/g, domain || "")
              .replace(/{{ToEmail}}/g, targetEmail)
              .replace(/{{ToName}}/g, toName)
              .replace(/{{ToDomain}}/g, toDomain)
              .replace(/{{MessageId}}/g, processedMsgId); // Standardize placeholder name
          };

          // Standardize line endings and provide default headers if empty
          let rawHeaderTemplate = (headers || "").trim();
          if (!rawHeaderTemplate) {
            rawHeaderTemplate =
              "Date: [[RFC_Date_UTC()]]\r\n" +
              "From: {{FromName}} <{{FromEmail}}>\r\n" +
              "Subject: {{SubjectLine}}\r\n" +
              "To: {{ToEmail}}\r\n" +
              "MIME-Version: 1.0\r\n" +
              "Content-Type: text/html; charset=utf-8";
          }
          let processedHeaders = replaceBaseTags(rawHeaderTemplate).replace(
            /\r?\n/g,
            "\r\n",
          );
          let processedHtml = replaceBaseTags(messageHtml || "").replace(
            /\r?\n/g,
            "\r\n",
          );
          let processedPlain = replaceBaseTags(messagePlain || "").replace(
            /\r?\n/g,
            "\r\n",
          );

          // 4. Advanced Content Encodings (Parity with PHP original)
          processedHeaders = processedHeaders
            .replace(/{{HtmlContent}}/g, processedHtml)
            .replace(/{{PlainContent}}/g, processedPlain)
            .replace(
              /{{HtmlContent_base64}}/g,
              Buffer.from(processedHtml).toString("base64"),
            )
            .replace(
              /{{PlainContent_base64}}/g,
              Buffer.from(processedPlain).toString("base64"),
            )
            .replace(
              /{{HtmlContent_qp}}/g,
              TagEngine.functions.ascii2hex(processedHtml),
            ) // Roughly equivalent to QP for matching logic
            .replace(
              /{{PlainContent_qp}}/g,
              TagEngine.functions.ascii2hex(processedPlain),
            );

          // 5. Final Pass with Tag Engine (Randomization Engine [[func]])
          processedHeaders = TagEngine.process(processedHeaders, context);
          processedHtml = TagEngine.process(processedHtml, context);
          processedPlain = TagEngine.process(processedPlain, context);

          // 5. Boundary replacement if exists
          const boundaryMatch = processedHeaders.match(
            /boundary=(?:"?)(.*?)(?:"?)(?:;|\s|$)/i,
          );
          if (boundaryMatch && boundaryMatch[1]) {
            processedHeaders = processedHeaders.replace(
              /{{boundary}}/g,
              boundaryMatch[1],
            );
          }

          const finalBody = `${processedHeaders}\r\n\r\n${processedHtml}`;

          const result = await client.send({
            user: ipRecord.user || "",
            pass: ipRecord.pass || "",
            from: fromEmail,
            to: targetEmail,
            body: finalBody,
            returnPath: TagEngine.process(returnPath || fromEmail, context),
          });

          if (result.success) {
            successCount++;
            output += `<pre><div style='background:black;color:white;'>[${targetEmail}] SUCCESS (ID: ${svmlId})\n${result.transcript}</div></pre>`;
          } else {
            errorCount++;
            output += `<pre><div style='background:black;color:white;border:1px solid red;'>[${targetEmail}] FAILED (ID: ${svmlId}): ${result.error}\n${result.transcript}</div></pre>`;
          }

          // 6. Log entry for stats
          await CampaignLog.create({
            campaign_id: svmlId,
            log_text: `Sent to ${targetEmail} via ${ip}. Status: ${result.success ? "Success" : "Failed"}`,
            type: result.success ? "success" : "error",
          });
        }
      }
      res.send(
        `${output}<br>Sent successfully to ${successCount} Subscribers. Errors: ${errorCount}`,
      );
    } else {
      res.send(`Bulk sending initiated. Campaign ID: ${svmlId}`);
    }
  } catch (error) {
    console.error("[LegacyController] Error:", error);
    res.status(500).send(`Error: ${error.message || error || "Unknown Error"}`);
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
