/**
 * fsockAutoController.js
 * Express controller — MERN equivalent of middle_fsock.php + get_link_fsock.php
 * + checkTestMessageResponse.php + Stats.php + Webhook.php
 */

const path = require("path");
const fs = require("fs");

const FsockAutoCampaign = require("../models/FsockAutoCampaign");
const FsockAutoTestStatus = require("../models/FsockAutoTestStatus");
const FsockWebhookEvent = require("../models/FsockWebhookEvent");
const SmtpDetail = require("../models/SmtpDetail");
const IP = require("../models/IP");
const ImapData = require("../models/ImapData");
const { autoSendQueue } = require("../queues/autoSendQueue");
const socketService = require("../services/socketService");

const DATA_DIR = process.env.DATA_FILE_PATH || "/var/www/data/";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Validate that all IPs in mailing_ip string exist in SmtpDetail DB */
const validateIps = async (mailingIpRaw) => {
  const lines = mailingIpRaw.split("\n").filter(Boolean);
  const ipKeys = lines.map((l) => l.split("|")[0].trim());
  const missing = [];
  for (const ipKey of ipKeys) {
    const foundIp = await IP.findOne({ ip: ipKey });
    if (!foundIp) {
      const foundSd =
        (await SmtpDetail.findOne({ assignedip: ipKey })) ||
        (await SmtpDetail.findOne({ server: ipKey }));
      if (!foundSd) missing.push(ipKey);
    }
  }
  return missing;
};

// ─── createCampaign ───────────────────────────────────────────────────────────

/**
 * POST /api/fsock-auto/campaign
 * Validates all inputs, creates a FsockAutoCampaign document,
 * and optionally queues the auto-send worker (if mode === 'Bulk' / auto).
 */
const createCampaign = asyncHandler(async (req, res) => {
  const {
    from_email,
    from_name,
    subject,
    subject_enc = "reset",
    from_enc = "reset",
    headers = "",
    mailing_ip,
    test_emails,
    message_html,
    message_plain = "",
    msgid = "",
    domain,
    offer_id,
    data_file,
    total_limit,
    send_limit,
    sleep_time = 2,
    wait_time = 1,
    inbox_percentage = 100,
    test_after = 100,
    name = "",
    auto_start = true, // if true, immediately queue the worker
    telegram_enabled = true,
  } = req.body;

  // ── Required field validation ──────────────────────────────────────────────
  if (!from_email)
    return res.status(400).json({ message: "From Email is required" });
  if (!mailing_ip)
    return res
      .status(400)
      .json({ message: "SMTP details (mailing_ip) are required" });
  if (!subject) return res.status(400).json({ message: "Subject is required" });
  if (!message_html)
    return res.status(400).json({ message: "HTML body is required" });
  if (!domain) return res.status(400).json({ message: "Domain is required" });
  if (!offer_id)
    return res.status(400).json({ message: "Offer ID is required" });

  if (auto_start) {
    if (!data_file)
      return res
        .status(400)
        .json({ message: "Data file is required to start a bulk campaign" });
    if (!total_limit || isNaN(total_limit))
      return res
        .status(400)
        .json({ message: "Total limit must be a number for bulk sending" });
    if (!send_limit || isNaN(send_limit))
      return res
        .status(400)
        .json({ message: "Send limit must be a number for bulk sending" });
  }

  // ── Validate inbox_percentage ──────────────────────────────────────────────
  if (inbox_percentage < 0 || inbox_percentage > 100) {
    return res
      .status(400)
      .json({ message: "Inbox percentage must be between 0 and 100" });
  }

  // ── Validate test emails (max 4) ───────────────────────────────────────────
  const testEmailArray = String(test_emails || "")
    .split("\n")
    .map((e) => e.trim())
    .filter(Boolean);
  if (testEmailArray.length === 0) {
    return res
      .status(400)
      .json({ message: "At least one test email is required" });
  }
  if (testEmailArray.length > 4) {
    return res.status(400).json({ message: "Maximum 4 test emails allowed" });
  }

  // ── Validate data file exists (ONLY IF BULK) ──────────────────────────────
  if (auto_start) {
    const dataFilePath = path.isAbsolute(data_file)
      ? data_file
      : path.join(DATA_DIR, data_file);
    if (!fs.existsSync(dataFilePath)) {
      return res
        .status(400)
        .json({ message: `Data file not found: ${data_file}` });
    }
    const fileLines = fs
      .readFileSync(dataFilePath, "utf8")
      .split("\n")
      .filter(Boolean);
    if (fileLines.length < Number(send_limit)) {
      return res.status(400).json({
        message: `Data file has only ${fileLines.length} lines but send_limit is ${send_limit}`,
      });
    }
  }

  // ── Validate IPs exist in DB ───────────────────────────────────────────────
  const missingIps = await validateIps(mailing_ip);
  if (missingIps.length > 0) {
    return res.status(400).json({
      message: `The following IPs are not configured in SMTP Details: ${missingIps.join(", ")}`,
    });
  }

  // ── Build IP array ─────────────────────────────────────────────────────────
  const mailingIpArray = mailing_ip
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // ── Create campaign document ───────────────────────────────────────────────
  const campaign = await FsockAutoCampaign.create({
    name,
    from_email,
    from_name: from_name || "",
    subject,
    subject_enc,
    from_enc,
    headers,
    mailing_ip_raw: mailing_ip,
    mailing_ip_array: mailingIpArray,
    test_email_raw: test_emails,
    test_email_array: testEmailArray,
    message_html,
    message_plain,
    msgid,
    domain,
    offer_id,
    data_file: data_file || "",
    total_limit: total_limit ? Number(total_limit) : 0,
    send_limit: send_limit ? Number(send_limit) : 0,
    sleep_time: Number(sleep_time),
    wait_time: Number(wait_time),
    inbox_percentage: Number(inbox_percentage),
    test_after: Number(test_after),
    telegram_enabled,
    status: auto_start ? "Pending" : "Pending",
  });

  // ── Queue the worker ───────────────────────────────────────────────────────
  await autoSendQueue.add(
    `${auto_start ? "auto-campaign-" : "test-campaign-"}${campaign._id}`,
    {
      campaignId: String(campaign._id),
      testOnly: !auto_start,
    },
    {
      attempts: 1,
      removeOnComplete: true,
      removeOnFail: 50,
    },
  );

  res.status(201).json({
    message: "Campaign created successfully",
    campaignId: campaign._id,
    campaign,
  });
});

// ─── getCampaign ──────────────────────────────────────────────────────────────

const getCampaign = asyncHandler(async (req, res) => {
  const campaign = await FsockAutoCampaign.findById(req.params.id).lean();
  if (!campaign) return res.status(404).json({ message: "Campaign not found" });
  res.json(campaign);
});

// ─── getCampaigns (list) ─────────────────────────────────────────────────────

const getCampaigns = asyncHandler(async (req, res) => {
  const campaigns = await FsockAutoCampaign.find()
    .select("-message_html -message_plain -headers")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  res.json(campaigns);
});

// ─── stopCampaign ─────────────────────────────────────────────────────────────

const stopCampaign = asyncHandler(async (req, res) => {
  const campaign = await FsockAutoCampaign.findByIdAndUpdate(
    req.params.id,
    { stop_flag: true, status: "Stopped" },
    { new: true },
  );
  if (!campaign) return res.status(404).json({ message: "Campaign not found" });

  // Emit stop event over socket
  const io = socketService.getIo();
  if (io) {
    io.to(String(req.params.id)).emit("campaign_log", {
      log: {
        _id: Date.now().toString(),
        log_text: `[${new Date().toLocaleTimeString()}] Campaign stopped by user.`,
        type: "warn",
        createdAt: new Date(),
      },
    });
  }
  res.json({ message: "Campaign stop signal sent", campaign });
});

// ─── getCampaignLogs (test status records) ────────────────────────────────────

const getCampaignLogs = asyncHandler(async (req, res) => {
  const logs = await FsockAutoTestStatus.find({ campaign_id: req.params.id })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  res.json(logs);
});

// ─── checkTestStatus ─────────────────────────────────────────────────────────

const checkTestStatus = asyncHandler(async (req, res) => {
  const { email, messageId } = req.query;
  if (!email || !messageId) {
    return res
      .status(400)
      .json({ message: "email and messageId are required" });
  }

  // Check ImapData first
  const imapRow = await ImapData.findOne({
    email,
    message_id: { $in: [`<${messageId}>`, messageId] },
  }).lean();

  if (imapRow) {
    // Update test status record
    await FsockAutoTestStatus.updateOne(
      { email, msgid: messageId, status: null },
      { $set: { status: imapRow.status } },
    );
    return res.json({ status: imapRow.status, found: true });
  }

  res.json({ status: null, found: false, message: "Still checking..." });
});

// ─── handleWebhook ────────────────────────────────────────────────────────────

const handleWebhook = asyncHandler(async (req, res) => {
  const { provider = "sendgrid" } = req.params;
  const { account } = req.query;
  const events = Array.isArray(req.body) ? req.body : [req.body];

  const docs = events
    .filter((e) => e && e.event && e.email)
    .map((e) => ({
      account: account || "unknown",
      provider,
      event_type: e.event,
      email: e.email,
      raw_payload: e,
      event_date: e.timestamp ? new Date(e.timestamp * 1000) : new Date(),
    }));

  if (docs.length > 0) {
    await FsockWebhookEvent.insertMany(docs);
  }

  res.status(200).json({ received: docs.length });
});

// ─── getWebhookStats ──────────────────────────────────────────────────────────

const getWebhookStats = asyncHandler(async (req, res) => {
  const { account } = req.query;
  const match = account ? { account } : {};

  const stats = await FsockWebhookEvent.aggregate([
    { $match: match },
    {
      $group: {
        _id: { account: "$account", event_type: "$event_type" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.account": 1, "_id.event_type": 1 } },
  ]);

  res.json(stats);
});

// ─── validateSmtp ─────────────────────────────────────────────────────────────

const validateSmtp = asyncHandler(async (req, res) => {
  const { mailing_ip } = req.body;
  if (!mailing_ip)
    return res.status(400).json({ message: "mailing_ip required" });

  const missing = await validateIps(mailing_ip);
  if (missing.length > 0) {
    return res.json({ valid: false, missing });
  }
  res.json({ valid: true });
});

// ─── getDataFileInfo ─────────────────────────────────────────────────────────

const getDataFileInfo = asyncHandler(async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.isAbsolute(filename)
    ? filename
    : path.join(DATA_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.json({ found: false, count: 0 });
  }
  const lines = fs.readFileSync(filePath, "utf8").split("\n").filter(Boolean);
  res.json({ found: true, count: lines.length });
});

module.exports = {
  createCampaign,
  getCampaign,
  getCampaigns,
  stopCampaign,
  getCampaignLogs,
  checkTestStatus,
  handleWebhook,
  getWebhookStats,
  validateSmtp,
  getDataFileInfo,
};
