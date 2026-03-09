const CampaignTemplate = require("../models/CampaignTemplate");
const IP = require("../models/IP");
const CampaignLog = require("../models/CampaignLog");
const Campaign = require("../models/Campaign");
const OfferSuppQueue = require("../models/OfferSuppQueue");
const RawSmtpClient = require("../services/smtpService");
const fs = require("fs");
const path = require("path");
const FsockAutoRunner = require("../services/FsockAutoRunner");
const TagEngine = require("../utils/tagEngine");
const { generateMessageId } = require("../utils/patternGenerator");

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
    // Find the latest campaign matching these criteria
    const campaign = await CampaignTemplate.findOne({
      $or: [{ name: subject }, { subject: subject }],
      domain: domain,
      offer_id: offer,
    }).sort({ createdAt: -1 });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Determine the base URL from referer to build the link
    // e.g., http://.../interface or http://.../fsock-send-smtp-auto
    const referer = req.headers.referer || "";
    const baseUrl = referer.split("?")[0];
    const trackLink = `${baseUrl}?c=${campaign._id}`;

    res.json({ in_link: trackLink });
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
    message_id,
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
      message_id: message_id,
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
          const targetEmail = email.trim();
          if (!targetEmail) continue;

          // Helper for tag replacements (Feature Parity)
          const context = {
            email: targetEmail,
            fromEmail,
            fromName: encodedFromName,
            subject: encodedSubject,
          };

          const [toName, toDomain] = targetEmail.split("@");
          const fromDomain = fromEmail.split("@")[1] || "";

          // Process Body/Headers with TagEngine and Logic
          let processedHeaders = headers || "";
          let processedHtml = messageHtml || "";
          let processedPlain = messagePlain || "";

          // 1. Basic Tag Replacements
          const replaceBaseTags = (str) => {
            return str
              .replace(/{{SubjectLine}}/g, encodedSubject)
              .replace(/{{FromEmail}}/g, fromEmail)
              .replace(/{{FromName}}/g, encodedFromName)
              .replace(/{{FromDomain}}/g, fromDomain)
              .replace(/{{Domain}}/g, domain || "")
              .replace(/{{ToEmail}}/g, targetEmail)
              .replace(/{{ToName}}/g, toName)
              .replace(/{{ToDomain}}/g, toDomain);
          };

          processedHeaders = replaceBaseTags(processedHeaders);
          processedHtml = replaceBaseTags(processedHtml);
          processedPlain = replaceBaseTags(processedPlain);

          // 2. Advanced Content Encodings (Parity with PHP original)
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
              TagEngine.functions.quotedPrintableEncode(processedHtml),
            )
            .replace(
              /{{PlainContent_qp}}/g,
              TagEngine.functions.quotedPrintableEncode(processedPlain),
            )
            .replace(
              /{{HtmlContent_uue}}/g,
              TagEngine.functions.strToUue(processedHtml),
            )
            .replace(
              /{{PlainContent_uue}}/g,
              TagEngine.functions.strToUue(processedPlain),
            );

          // 3. Process Message ID (Standardized with /interface)
          let finalMsgId = message_id || "";
          if (!finalMsgId) {
            finalMsgId = generateMessageId(1, domain || "localhost");
          } else if (!isNaN(finalMsgId) && finalMsgId.length < 3) {
            finalMsgId = generateMessageId(finalMsgId, domain || "localhost");
          }

          let processedMsgId = TagEngine.process(finalMsgId, {
            domain: domain,
            email: targetEmail,
            offer_id: offerId,
          });

          processedHeaders = processedHeaders.replace(
            /{{MessageId}}/g,
            processedMsgId,
          );

          // 4. Final Pass with Tag Engine (Randomization Engine [[func]])
          processedHeaders = TagEngine.process(processedHeaders, context);
          processedHtml = TagEngine.process(processedHtml, context);
          processedPlain = TagEngine.process(processedPlain, context);

          // 5. Boundary replacement if exists
          const boundaryMatch = processedHeaders.match(
            /boundary=(?:"?)(.*?)(?:"?)(?:;|\s|\r|\n|$)/i,
          );
          if (boundaryMatch && boundaryMatch[1]) {
            const boundary = boundaryMatch[1].replace(/['"]/g, "").trim();
            processedHeaders = processedHeaders.replace(
              /{{boundary}}/g,
              boundary,
            );
            processedHtml = processedHtml.replace(/{{boundary}}/g, boundary);
          }

          const finalBody = `${processedHeaders}\r\n\r\n${processedHtml}`;

          // Tag processing for return path
          let processedReturnPath = returnPath || fromEmail;
          processedReturnPath = TagEngine.process(processedReturnPath, context);

          const result = await client.send({
            user: ipRecord.user || "",
            pass: ipRecord.pass || "",
            from: fromEmail,
            to: targetEmail,
            body: finalBody,
            returnPath: processedReturnPath,
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
    res.status(500).send(`Error: ${error.message}`);
  }
};

// @desc    Start FSOCK Auto Campaign
// @route   POST /api/legacy/fsock-auto-start
const startFsockAuto = async (req, res) => {
  const { sub: subject, mode } = req.body;
  try {
    // 1. Create a Campaign record (not just a template) for live tracking
    const normalizedMode = (mode || "Bulk").toLowerCase();
    const campaignType = normalizedMode === "test" ? "test_auto" : "bulk_auto";

    const campaign = await Campaign.create({
      template_name: subject || "FSock Auto Campaign",
      name: subject || "FSock Auto Campaign",
      status: "Running",
      start_time: new Date(),
      type: campaignType,
      mode: normalizedMode,
    });

    // 1b. Also create/update Template record so "Get Track Link" can find it
    await CampaignTemplate.create({
      name: subject || "FSock Auto Campaign",
      from_email: req.body.from_email,
      subject: subject,
      from_name: req.body.from,
      message_html: req.body.message_html,
      message_plain: req.body.message_plain,
      headers: req.body.headers,
      offer_id: req.body.offerId,
      domain: req.body.domain,
      message_id: req.body.message_id,
      mode: mode || "Bulk",
      sleep_time: req.body.sleep,
      wait_time: req.body.wait,
      inbox_percent: req.body.inbox_percentage,
      mail_after: req.body.test_after,
    });

    // 2. Start the runner
    FsockAutoRunner.start(campaign._id, req.body);

    res.json({
      message: "FSOCK Auto Campaign Started",
      campaignId: campaign._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Stop FSOCK Auto Campaign
// @route   POST /api/legacy/fsock-auto-stop/:id
const stopFsockAuto = async (req, res) => {
  try {
    const { id } = req.params;
    FsockAutoRunner.stop(id);
    await Campaign.findByIdAndUpdate(id, { status: "Stopped" });
    res.json({ message: "FSOCK Auto Campaign Stopped" });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
  startFsockAuto,
  stopFsockAuto,
};
