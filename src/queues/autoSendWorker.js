/**
 * autoSendWorker.js
 * BullMQ worker — MERN equivalent of auto_send.php.
 *
 * Flow:
 *  1. Pull campaign from DB
 *  2. Validate data file
 *  3. Pick random IPs + test emails
 *  4. Send test emails via Nodemailer (record in FsockAutoTestStatus)
 *  5. Poll ImapData for INBOX/SPAM results (20-min timeout, max 3 retriggers)
 *  6. If inbox% passes → send bulk batch per IP → sleep → repeat until total_limit
 *  7. stop_flag polling between every batch
 *  8. On completion/failure → update DB + Telegram
 */

const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const FsockAutoCampaign = require("../models/FsockAutoCampaign");
const FsockAutoTestStatus = require("../models/FsockAutoTestStatus");
const ImapData = require("../models/ImapData");
const SmtpDetail = require("../models/SmtpDetail");
const IP = require("../models/IP");
const socketService = require("../services/socketService");
const { sendCampaignNotification } = require("../services/telegramService");
const { applyPlaceholders, encodeHeader } = require("../services/fsockHelpers");
const { getNodemailerDkimOptions } = require("../services/dkimService");

const IMAP_POLL_INTERVAL_MS = 5000; // 5 s between polls
const MAX_WAIT_MS = 20 * 60 * 1000; // 20 min
const MAX_RETRIGGERS = 3;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const emitLog = (campaignId, message, type = "info") => {
  const log = {
    _id: Date.now().toString(),
    log_text: `[${new Date().toLocaleTimeString()}] ${message}`,
    type,
    createdAt: new Date(),
  };
  socketService.emitLog(campaignId, log);
  console.log(`[AutoSend/${campaignId}] ${message}`);
};

/** Resolve SMTP config for an IP key from SmtpDetail or IP model */
const resolveSmtp = async (ipKey) => {
  const clean = String(ipKey).split("|")[0].trim();

  // Try IP model first
  let rec = await IP.findOne({ ip: clean });
  if (rec && rec.hostname) {
    return {
      host: rec.hostname,
      port: rec.port || 25,
      secure: rec.tls === "Yes",
      auth: rec.user ? { user: rec.user, pass: rec.pass } : null,
      tls: { rejectUnauthorized: false },
    };
  }

  // Fallback: SmtpDetail
  let sd =
    (await SmtpDetail.findOne({ assignedip: clean })) ||
    (await SmtpDetail.findOne({ server: clean }));
  if (sd && sd.hostname) {
    const isSecure = ["1", "yes", "true"].includes(
      String(sd.tls || "").toLowerCase(),
    );
    return {
      host: sd.hostname,
      port: Number(sd.port) || (isSecure ? 465 : 587),
      secure: isSecure,
      auth: sd.user && sd.pass ? { user: sd.user, pass: sd.pass } : null,
      tls: { rejectUnauthorized: false },
    };
  }
  return null;
};

/** Build the final email body from template + per-email substitutions */
const buildEmailOptions = (campaign, email, ip) => {
  const md5 = (s) => crypto.createHash("md5").update(s).digest("hex");

  let msgid = campaign.msgid || "";
  msgid = applyPlaceholders(msgid);
  msgid = msgid.replace(/\{\{Domain\}\}/g, campaign.domain || "");

  const fromParts = email.split("@");
  const toName = fromParts[0] || "";
  const toDomain = fromParts[1] || "";
  const fromDomain = (campaign.from_email || "").split("@")[1] || "";
  const trackMd5 = md5(email);

  const replaceCommon = (s) =>
    (s || "")
      .replace(/\{\{ToEmail\}\}/g, email)
      .replace(/\{\{ToName\}\}/g, toName)
      .replace(/\{\{ToDomain\}\}/g, toDomain)
      .replace(/\{\{FromEmail\}\}/g, campaign.from_email || "")
      .replace(/\{\{FromName\}\}/g, campaign.from_name || "")
      .replace(/\{\{FromDomain\}\}/g, fromDomain)
      .replace(/\{\{Domain\}\}/g, campaign.domain || "")
      .replace(/\{\{MessageId\}\}/g, msgid)
      .replace(/\(\(_track_\)\)/g, trackMd5);

  const html = replaceCommon(campaign.message_html);
  const plain = replaceCommon(campaign.message_plain);
  const subject = encodeHeader(campaign.subject, campaign.subject_enc);
  const fromName = encodeHeader(campaign.from_name || "", campaign.from_enc);

  // Return path from IP string (IP|returnPath format)
  const ipParts = String(ip).split("|");
  const returnPath = ipParts[1] ? ipParts[1].trim() : campaign.from_email;

  return { html, plain, subject, fromName, msgid, returnPath, trackMd5 };
};

// ─── Send a single email via Nodemailer ───────────────────────────────────────

const sendOneEmail = async (campaign, email, ip, smtpCfg) => {
  const { html, plain, subject, fromName, msgid, returnPath } =
    buildEmailOptions(campaign, email, ip);

  const transporter = nodemailer.createTransport(smtpCfg);

  const mailOpts = {
    from: `"${fromName}" <${returnPath}>`,
    to: email,
    subject,
    messageId: msgid ? `<${msgid}>` : undefined,
    html,
    text: plain || undefined,
    envelope: {
      from: returnPath,
      to: email,
    },
  };

  // Add DKIM if configured
  const dkimConfig = getNodemailerDkimOptions(campaign.domain, "default");
  if (dkimConfig) {
    mailOpts.dkim = dkimConfig;
  }

  // Custom headers
  if (campaign.headers) {
    const customHeaders = {};
    campaign.headers.split("\n").forEach((line) => {
      const idx = line.indexOf(":");
      if (idx > 0) {
        const key = line.slice(0, idx).trim();
        const val = line.slice(idx + 1).trim();
        if (key) customHeaders[key] = applyPlaceholders(val);
      }
    });
    mailOpts.headers = customHeaders;
  }

  const info = await transporter.sendMail(mailOpts);
  return { success: true, messageId: info.messageId || msgid };
};

// ─── Step 3: Pick random IPs and emails ────────────────────────────────────────

const getRandomIpsAndEmails = (campaign) => {
  let ips = [...campaign.mailing_ip_array];
  let emails = [...campaign.test_email_array];

  if (ips.length > 3) {
    ips = ips.sort(() => 0.5 - Math.random()).slice(0, 3);
  }
  if (emails.length > 2) {
    emails = emails.sort(() => 0.5 - Math.random()).slice(0, 2);
  }
  return { ips, emails };
};

// ─── Step 4: Send test emails ──────────────────────────────────────────────────

const sendTestEmails = async (campaign, ips, emails) => {
  const sentMap = {}; // { email: [msgid, ...] }

  for (const ip of ips) {
    const smtpCfg = await resolveSmtp(ip);
    if (!smtpCfg) {
      emitLog(campaign._id, `SMTP not found for IP: ${ip}`, "error");
      continue;
    }

    for (const email of emails) {
      try {
        const { success, messageId } = await sendOneEmail(
          campaign,
          email,
          ip,
          smtpCfg,
        );
        const cleanMsgId = (messageId || "").replace(/[<>]/g, "");

        // Record in DB
        await FsockAutoTestStatus.create({
          campaign_id: campaign._id,
          ip,
          email,
          msgid: cleanMsgId,
          mode: "Bulk Test",
          sent_status: success ? 1 : 0,
        });

        if (!sentMap[email]) sentMap[email] = [];
        if (success) sentMap[email].push(cleanMsgId);

        emitLog(
          campaign._id,
          `Test sent to ${email} via ${ip} | MsgID: ${cleanMsgId}`,
          success ? "success" : "error",
        );
      } catch (err) {
        emitLog(
          campaign._id,
          `Test send error to ${email} via ${ip}: ${err.message}`,
          "error",
        );
        // Record failed
        await FsockAutoTestStatus.create({
          campaign_id: campaign._id,
          ip,
          email,
          msgid: `failed-${Date.now()}`,
          mode: "Bulk Test",
          sent_status: 0,
        });
      }
    }
  }
  return sentMap;
};

// ─── Step 5: Poll IMAP and check inbox percentage ─────────────────────────────

const matchInboxPercentage = async (campaign, sentMap, retrigerCount) => {
  const totalSent = Object.values(sentMap).reduce(
    (s, arr) => s + arr.length,
    0,
  );
  if (totalSent === 0) {
    emitLog(
      campaign._id,
      "No test emails were sent successfully. Stopping.",
      "error",
    );
    return false;
  }

  const required = Number(campaign.inbox_percentage) || 100;
  let totalReceived = 0;
  let inboxCount = 0;
  let spamCount = 0;
  const startTime = Date.now();

  emitLog(
    campaign._id,
    `Polling IMAP for ${totalSent} test emails... Required inbox: ${required}%`,
  );

  // Track which msgIds are still pending
  const pending = new Map(); // email → Set(msgids)
  for (const [email, msgids] of Object.entries(sentMap)) {
    pending.set(email, new Set(msgids));
  }

  while (totalReceived < totalSent) {
    // Timeout check
    if (Date.now() - startTime > MAX_WAIT_MS) {
      if (retrigerCount >= MAX_RETRIGGERS) {
        emitLog(
          campaign._id,
          `Max retriggers (${MAX_RETRIGGERS}) reached. Stopping.`,
          "error",
        );
        return false;
      }
      emitLog(
        campaign._id,
        `20-min timeout. Retriggering test (attempt ${retrigerCount + 1})...`,
        "warn",
      );
      return "retrigger";
    }

    // Poll ImapData for each pending email
    for (const [email, msgids] of pending.entries()) {
      if (msgids.size === 0) continue;

      const found = await ImapData.find({
        email,
        message_id: {
          $in: Array.from(msgids)
            .map((m) => `<${m}>`)
            .concat(Array.from(msgids)),
        },
      }).lean();

      for (const row of found) {
        const cleanId = (row.message_id || "").replace(/[<>]/g, "");
        if (msgids.has(cleanId)) {
          msgids.delete(cleanId);
          totalReceived++;

          // Update FsockAutoTestStatus
          await FsockAutoTestStatus.updateOne(
            { campaign_id: campaign._id, msgid: cleanId, status: null },
            { $set: { status: row.status } },
          );

          if (row.status === "INBOX") inboxCount++;
          else if (row.status === "SPAM") spamCount++;
        }
      }
    }

    const fetchedPct =
      totalSent > 0 ? ((inboxCount / totalSent) * 100).toFixed(1) : 0;
    emitLog(
      campaign._id,
      `Total Sent: ${totalSent} | Received: ${totalReceived} | INBOX: ${inboxCount} | SPAM: ${spamCount} | Inbox%: ${fetchedPct}%`,
    );

    if (totalReceived < totalSent) await sleep(IMAP_POLL_INTERVAL_MS);
  }

  const finalPct = totalSent > 0 ? (inboxCount / totalSent) * 100 : 0;
  emitLog(
    campaign._id,
    `Final Inbox%: ${finalPct.toFixed(1)}% | Required: ${required}%`,
  );
  return finalPct >= required;
};

// ─── Step 6: Send bulk batch ───────────────────────────────────────────────────

const sendBulkBatch = async (campaign, emailChunk, ip, smtpCfg) => {
  let success = 0;
  let errors = 0;

  for (const rawEmail of emailChunk) {
    const email = String(rawEmail).trim();
    if (!email) continue;

    try {
      await sendOneEmail(campaign, email, ip, smtpCfg);
      success++;
    } catch (err) {
      errors++;
      emitLog(
        campaign._id,
        `Bulk send error to ${email}: ${err.message}`,
        "error",
      );
    }
  }

  // Update campaign stats
  await FsockAutoCampaign.findByIdAndUpdate(campaign._id, {
    $inc: { success_count: success, error_count: errors, total_sent: success },
  });

  return success;
};

// ─── Data file helpers ─────────────────────────────────────────────────────────

const readDataFile = (filename) => {
  const { DATA_PATH, BUFFER_PATH } = require("../config/paths");
  const primaryPath = path.isAbsolute(filename)
    ? filename
    : path.join(DATA_PATH, filename);
  const bufferFallbackPath = path.join(BUFFER_PATH, path.basename(filename));

  const primaryExists = fs.existsSync(primaryPath);
  const bufferExists = fs.existsSync(bufferFallbackPath);

  let filePath = null;
  if (primaryExists && bufferExists) {
    const primarySize = fs.statSync(primaryPath).size;
    const bufferSize = fs.statSync(bufferFallbackPath).size;
    filePath =
      primarySize === 0 && bufferSize > 0 ? bufferFallbackPath : primaryPath;
  } else if (primaryExists) {
    filePath = primaryPath;
  } else if (bufferExists) {
    filePath = bufferFallbackPath;
  }

  if (!filePath || !fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf8").split("\n").filter(Boolean);
};

const writeDataFile = (filename, lines) => {
  const { DATA_PATH } = require("../config/paths");
  const filePath = path.isAbsolute(filename)
    ? filename
    : path.join(DATA_PATH, filename);
  fs.writeFileSync(filePath, lines.join("\n") + "\n", "utf8");
};

// ─── Main Worker ───────────────────────────────────────────────────────────────

const autoSendWorkerProcessor = async (job) => {
  const { campaignId, testOnly } = job.data;

  let campaign = await FsockAutoCampaign.findById(campaignId);
  if (!campaign) {
    console.error(`[AutoSend] Campaign ${campaignId} not found`);
    return;
  }

  // Mark as Running
  campaign = await FsockAutoCampaign.findByIdAndUpdate(
    campaignId,
    { status: "Running", started_at: new Date(), stop_flag: false },
    { new: true },
  );

  if (testOnly) {
    emitLog(
      campaignId,
      `Test Only Execution Started: ${campaign.name || campaignId}`,
    );
    try {
      const { ips, emails } = getRandomIpsAndEmails(campaign);
      emitLog(
        campaignId,
        `Sending test emails to: ${emails.join(", ")} via IPs: ${ips.join(", ")}`,
      );
      await sendTestEmails(campaign, ips, emails);
      emitLog(campaignId, "Test sending completed successfully.", "success");
      await FsockAutoCampaign.findByIdAndUpdate(campaignId, {
        status: "Stopped",
      });
      return;
    } catch (err) {
      emitLog(campaignId, `Test error: ${err.message}`, "error");
      await FsockAutoCampaign.findByIdAndUpdate(campaignId, {
        status: "Failed",
      });
      return;
    }
  }

  emitLog(
    campaignId,
    `Auto Sending Started with campaign: ${campaign.name || campaignId}`,
  );
  await sendCampaignNotification(campaign, "Campaign Started");

  try {
    // --- Validate data file ---
    const allLines = readDataFile(campaign.data_file);
    if (!allLines) {
      const msg = `Data file not found: ${campaign.data_file}`;
      emitLog(campaignId, msg, "error");
      await FsockAutoCampaign.findByIdAndUpdate(campaignId, {
        status: "Failed",
      });
      await sendCampaignNotification(campaign, msg);
      return;
    }

    if (allLines.length < campaign.send_limit) {
      const msg = `Data file has ${allLines.length} emails but send_limit is ${campaign.send_limit}`;
      emitLog(campaignId, msg, "error");
      await FsockAutoCampaign.findByIdAndUpdate(campaignId, {
        status: "Failed",
      });
      await sendCampaignNotification(campaign, msg);
      return;
    }

    emitLog(
      campaignId,
      `Data file OK: ${allLines.length} emails | Total limit: ${campaign.total_limit}`,
    );

    let totalSuccessSent = 0;
    const totalLimit = Number(campaign.total_limit);
    const retestAfter = Number(campaign.test_after) || 100;
    const sleepTime = Number(campaign.sleep_time) || 2;
    const waitTime = Number(campaign.wait_time) || 1;
    const sendLimit = Number(campaign.send_limit) || 10;
    const intervalTime = Number(campaign.interval_time) || 0; // minutes
    let retrigerCount = 0;

    // ── OUTER LOOP: repeat until totalLimit reached ──────────────────────────
    while (totalSuccessSent < totalLimit) {
      // Stop flag check
      const freshCampaign = await FsockAutoCampaign.findById(campaignId).lean();
      if (
        !freshCampaign ||
        freshCampaign.stop_flag ||
        freshCampaign.status === "Stopped"
      ) {
        emitLog(campaignId, "Stop flag detected. Halting campaign.", "warn");
        break;
      }

      campaign = await FsockAutoCampaign.findById(campaignId);

      // ── Test phase ────────────────────────────────────────────────────────
      emitLog(campaignId, "Getting random IPs and emails for testing...");
      const { ips, emails } = getRandomIpsAndEmails(campaign);

      emitLog(
        campaignId,
        `Sending test emails to: ${emails.join(", ")} via IPs: ${ips.join(", ")}`,
      );
      const sentMap = await sendTestEmails(campaign, ips, emails);

      // Check all test sent
      const allSent = Object.values(sentMap).reduce((s, a) => s + a.length, 0);
      if (allSent === 0) {
        emitLog(
          campaignId,
          "All test emails failed to send. Stopping.",
          "error",
        );
        await FsockAutoCampaign.findByIdAndUpdate(campaignId, {
          status: "Failed",
        });
        await sendCampaignNotification(
          campaign,
          "All test emails failed to send.",
        );
        return;
      }

      // ── Match inbox percentage ────────────────────────────────────────────
      emitLog(
        campaignId,
        `Checking inbox %... Required: ${campaign.inbox_percentage}%`,
      );
      let inboxResult = await matchInboxPercentage(
        campaign,
        sentMap,
        retrigerCount,
      );

      if (inboxResult === "retrigger") {
        retrigerCount++;
        emitLog(
          campaignId,
          `Retrigger #${retrigerCount}. Restarting test phase...`,
          "warn",
        );
        continue; // restart outer loop = retrigger test
      }

      if (!inboxResult) {
        emitLog(campaignId, "Inbox % not matched. Stopping campaign.", "error");
        await FsockAutoCampaign.findByIdAndUpdate(campaignId, {
          status: "Failed",
        });
        await sendCampaignNotification(
          campaign,
          "Inbox percentage not matched. Campaign halted.",
        );
        return;
      }

      retrigerCount = 0; // reset on success
      emitLog(campaignId, "Inbox % matched! Starting bulk send...", "success");

      // ── Bulk send phase (send retestAfter emails before re-testing) ────────
      let batchSent = 0;
      const ipArray = campaign.mailing_ip_array;

      while (batchSent < retestAfter && totalSuccessSent < totalLimit) {
        // Re-check stop flag
        const midCampaign = await FsockAutoCampaign.findById(campaignId).lean();
        if (
          !midCampaign ||
          midCampaign.stop_flag ||
          midCampaign.status === "Stopped"
        ) {
          emitLog(campaignId, "Stop flag detected mid-batch. Halting.", "warn");
          await FsockAutoCampaign.findByIdAndUpdate(campaignId, {
            status: "Stopped",
          });
          return;
        }

        // Read + slice data file
        const currentLines = readDataFile(campaign.data_file);
        if (!currentLines || currentLines.length < sendLimit) {
          emitLog(
            campaignId,
            "Data file exhausted. Campaign complete.",
            "success",
          );
          totalSuccessSent = totalLimit; // exit outer loop
          break;
        }

        // Chunk per IP
        const totalChunk = sendLimit * ipArray.length;
        const chunk = currentLines.slice(0, totalChunk);
        const remaining = currentLines.slice(totalChunk);
        writeDataFile(campaign.data_file, remaining);

        const perIpChunks = [];
        for (let i = 0; i < ipArray.length; i++) {
          perIpChunks.push(chunk.slice(i * sendLimit, (i + 1) * sendLimit));
        }

        let batchTotal = 0;
        for (let i = 0; i < ipArray.length; i++) {
          const ip = ipArray[i];
          const smtpCfg = await resolveSmtp(ip);
          if (!smtpCfg) {
            emitLog(
              campaignId,
              `SMTP not found for IP ${ip} — skipping`,
              "error",
            );
            continue;
          }

          const sent = await sendBulkBatch(
            campaign,
            perIpChunks[i],
            ip,
            smtpCfg,
          );
          batchTotal += sent;
          emitLog(
            campaignId,
            `Sent ${sent}/${sendLimit} to bulk via ${ip} | Remaining data: ${remaining.length - totalChunk * i}`,
            "success",
          );

          // Wait between IPs
          if (waitTime > 0 && i < ipArray.length - 1) {
            emitLog(campaignId, `Waiting ${waitTime}s between IPs...`);
            await sleep(waitTime * 1000);
          }
        }

        batchSent += batchTotal;
        totalSuccessSent += batchTotal;

        emitLog(
          campaignId,
          `Batch complete: ${batchSent}/${retestAfter} | Total: ${totalSuccessSent}/${totalLimit}`,
        );

        // Sleep between cycles
        if (intervalTime > 0) {
          emitLog(
            campaignId,
            `Space Sending: Sleeping ${intervalTime} minutes before next batch...`,
            "warn",
          );
          await sleep(intervalTime * 60 * 1000);
        } else if (sleepTime > 0) {
          emitLog(campaignId, `Sleeping ${sleepTime}s...`);
          await sleep(sleepTime * 1000);
        }
      }
    }

    // ── Campaign Done ─────────────────────────────────────────────────────────
    const finalMsg = `Campaign Completed! Total Sent: ${totalSuccessSent}`;
    emitLog(campaignId, finalMsg, "success");
    await FsockAutoCampaign.findByIdAndUpdate(campaignId, {
      status: "Completed",
      completed_at: new Date(),
    });
    await sendCampaignNotification(campaign, finalMsg);
  } catch (err) {
    console.error(
      `[AutoSend] Unhandled error for campaign ${campaignId}:`,
      err,
    );
    emitLog(campaignId, `Fatal error: ${err.message}`, "error");
    await FsockAutoCampaign.findByIdAndUpdate(campaignId, { status: "Failed" });
    await sendCampaignNotification(campaign, `Campaign Failed: ${err.message}`);
    throw err;
  }
};

module.exports = autoSendWorkerProcessor;
