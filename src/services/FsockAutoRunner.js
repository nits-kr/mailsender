/**
 * FsockAutoRunner.js
 *
 * Implements the Test -> Monitor -> Bulk -> Repeat loop for FSOCK SMTP Sending.
 * Features:
 * - Pick random seeds (TestIds) and IPs for testing.
 * - Monitor ImapData for inbox/spam results.
 * - Threshold-based bulk sending.
 * - Adaptive re-testing after `test_after` emails.
 * - Socket.io integration for live logging.
 */

const Campaign = require("../models/Campaign");
const CampaignLog = require("../models/CampaignLog");
const TestId = require("../models/TestId");
const ImapData = require("../models/ImapData");
const RawSmtpClient = require("./smtpService");
const socketService = require("./socketService");
const TagEngine = require("../utils/tagEngine");
const { generateMessageId } = require("../utils/patternGenerator");
const fs = require("fs-extra");
const path = require("path");
const { DATA_PATH, BUFFER_PATH } = require("../config/paths");
const { resolveSmtpDetails } = require("../utils/smtpResolver");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class FsockAutoRunner {
  constructor() {
    this.runningCampaigns = new Map(); // campaignId -> { stop: bool }
  }

  async start(campaignId, config) {
    if (this.runningCampaigns.has(String(campaignId))) {
      return;
    }

    const handle = { stop: false };
    this.runningCampaigns.set(String(campaignId), handle);

    // Initial log
    await this._log(
      campaignId,
      `[AUTO] Starting adaptive FSOCK campaign ${campaignId}...`,
      "info",
    );

    this._runLoop(campaignId, config, handle).catch((err) => {
      this._log(campaignId, `[AUTO] Fatal Loop Error: ${err.message}`, "error");
      this.stop(campaignId);
    });
  }

  stop(campaignId) {
    const handle = this.runningCampaigns.get(String(campaignId));
    if (handle) {
      handle.stop = true;
      this.runningCampaigns.delete(String(campaignId));
    }
  }

  async _runLoop(campaignId, config, handle) {
    const testAfterCount = Number(config.test_after) || 100;
    const threshold = Number(config.inbox_percentage) || 50;

    while (!handle.stop) {
      // Phase 1: Inbox Test
      await this._log(
        campaignId,
        "[AUTO] Phase: INBOX TEST. Picking random seeds...",
        "info",
      );

      const seeds = await this._getRandomSeeds(3);
      if (seeds.length === 0) {
        await this._log(
          campaignId,
          "[AUTO] No active Test IDs found. Waiting 30s...",
          "error",
        );
        await sleep(30000);
        continue;
      }

      const testResults = await this._performTest(campaignId, config, seeds);

      // Phase 2: Monitor
      await this._log(
        campaignId,
        `[AUTO] Phase: MONITORING. Waiting for ${seeds.length} results (Threshold: ${threshold}%)...`,
        "info",
      );
      const inboxRate = await this._monitorResults(
        campaignId,
        testResults,
        handle,
      );

      if (handle.stop) break;

      if (inboxRate < threshold) {
        await this._log(
          campaignId,
          `[AUTO] Inbox rate ${inboxRate}% below threshold ${threshold}%. Retrying test in 60s...`,
          "error",
        );
        await sleep(60000);
        continue;
      }

      // Phase 3: Bulk Sending
      await this._log(
        campaignId,
        `[AUTO] Phase: BULK. Target: ${testAfterCount} emails.`,
        "success",
      );
      const sentCount = await this._sendBulk(
        campaignId,
        config,
        testAfterCount,
        handle,
      );

      if (handle.stop) break;

      const campaign = await Campaign.findById(campaignId);
      if (
        !campaign ||
        campaign.status === "Stopped" ||
        campaign.success_count >= Number(config.total_limit)
      ) {
        await this._log(
          campaignId,
          "[AUTO] Campaign completed or stopped manually.",
          "success",
        );
        break;
      }
    }

    this.stop(campaignId);
    await Campaign.findByIdAndUpdate(campaignId, {
      status: "Completed",
      end_time: new Date(),
    });
  }

  async _getRandomSeeds(count) {
    return await TestId.aggregate([
      { $match: { status: "A" } },
      { $sample: { size: count } },
    ]);
  }

  async _performTest(campaignId, config, seeds) {
    const testResults = [];
    const ipLines = config.mailing_ip.trim().split("\n");
    const testIps = ipLines.slice(0, Math.min(ipLines.length, seeds.length));

    for (let i = 0; i < seeds.length; i++) {
      const seed = seeds[i];
      const ipLine = testIps[i % testIps.length];
      const [ip, returnPath] = ipLine.split("|");

      if (seeds.length === 0) {
        await this._log(
          campaignId,
          "[AUTO] No active monitoring mailboxes (seeds) found. Please add active mailboxes in TestIds Portal.",
          "warn",
        );
        return [];
      }

      // Generate Message-ID for tracking (Standardized with /interface)
      let finalMsgId = config.message_id || "";
      if (!finalMsgId) {
        finalMsgId = generateMessageId(1, config.domain || "localhost");
      } else if (!isNaN(finalMsgId) && finalMsgId.length < 3) {
        finalMsgId = generateMessageId(
          finalMsgId,
          config.domain || "localhost",
        );
      }

      const processedMsgId = TagEngine.process(finalMsgId, {
        domain: config.domain,
        email: seed.email,
        offer_id: config.offerId,
      });

      // Sending logic...
      const success = await this._dispatchSingle(
        campaignId,
        config,
        seed.email,
        ipLine,
        processedMsgId,
      );

      if (success) {
        testResults.push({
          email: seed.email,
          msgId: processedMsgId,
          status: "PENDING",
        });
      }
    }
    return testResults;
  }

  async _monitorResults(campaignId, testResults, handle) {
    const maxWait = 300000; // 5 minutes
    const start = Date.now();
    let reflectedCount = 0;
    let inboxCount = 0;

    let checkedIds = new Set();

    while (Date.now() - start < maxWait && !handle.stop) {
      for (const res of testResults) {
        if (checkedIds.has(res.msgId)) continue;

        const found = await ImapData.findOne({
          email: res.email,
          message_id: new RegExp(
            res.msgId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "i",
          ),
        });

        if (found) {
          res.status = found.status;
          reflectedCount++;
          if (found.status === "INBOX") inboxCount++;
          checkedIds.add(res.msgId);

          // Emit specific seed update to frontend
          if (socketService.getIo()) {
            socketService
              .getIo()
              .to(String(campaignId))
              .emit("test_seed_update", {
                email: res.email,
                status: res.status,
                msgId: res.msgId,
              });
          }
        }
      }

      if (reflectedCount === testResults.length) break;
      await sleep(10000); // Check every 10s
    }

    const rate =
      reflectedCount > 0 ? Math.round((inboxCount / reflectedCount) * 100) : 0;
    await this._log(
      campaignId,
      `[MONITOR] Results: ${inboxCount} INBOX, ${reflectedCount - inboxCount} SPAM out of ${testResults.length} seeds. Rate: ${rate}%`,
      "info",
    );
    return rate;
  }

  async _sendBulk(campaignId, config, count, handle) {
    const dataFilePath = path.join(DATA_PATH, config.datafile);

    if (!(await fs.exists(dataFilePath))) {
      await this._log(
        campaignId,
        `[BULK] Datafile not found: ${dataFilePath}`,
        "error",
      );
      return 0;
    }

    // Load chunk
    const content = await fs.readFile(dataFilePath, "utf8");
    const lines = content.split("\n").filter((l) => l.trim());
    const chunk = lines.slice(0, count);
    const remaining = lines.slice(count).join("\n");

    // Atomic-like update (overwrite file)
    await fs.writeFile(dataFilePath, remaining);

    const ipLines = config.mailing_ip.trim().split("\n");
    let sentCount = 0;

    // Parallelize across available IPs (Feature Parity with PHP `&` execution)
    const concurrency = ipLines.length || 1;

    for (let i = 0; i < chunk.length && !handle.stop; i += concurrency) {
      const batch = chunk.slice(i, i + concurrency);

      const batchPromises = batch.map(async (email, idx) => {
        const ipLine = ipLines[(i + idx) % ipLines.length];
        return this._dispatchSingle(campaignId, config, email.trim(), ipLine);
      });

      const results = await Promise.all(batchPromises);
      sentCount += results.filter(Boolean).length;

      if (config.wait) await sleep(Number(config.wait) * 1000);

      // Update campaign stats
      await Campaign.findByIdAndUpdate(campaignId, {
        $inc: {
          success_count: results.filter(Boolean).length,
          error_count: results.filter((r) => !r).length,
        },
      });
    }

    return sentCount;
  }

  _encodeHeader(text, type) {
    if (!text || type === "reset" || !type) return text;
    if (type === "base64")
      return `=?UTF-8?B?${Buffer.from(text).toString("base64")}?=`;
    if (type === "ascii") {
      return `=?UTF-8?Q?${TagEngine.functions.ascii2hex(text)}?=`;
    }
    return text;
  }

  async _dispatchSingle(
    campaignId,
    config,
    targetEmail,
    ipLine,
    overrideMsgId = null,
  ) {
    const [ipKey, returnPath] = ipLine.split("|");
    const smtpDetails = await resolveSmtpDetails(ipKey);
    if (!smtpDetails) return false;

    const client = new RawSmtpClient({
      host: smtpDetails.host,
      port: smtpDetails.port,
    });

    const authUser = smtpDetails.user || "";
    const authPass = smtpDetails.pass || "";

    let finalMsgId = overrideMsgId;

    if (!finalMsgId) {
      finalMsgId = config.message_id || "";
      if (!finalMsgId) {
        finalMsgId = generateMessageId(1, config.domain || "localhost");
      } else if (!isNaN(finalMsgId) && finalMsgId.length < 3) {
        finalMsgId = generateMessageId(
          finalMsgId,
          config.domain || "localhost",
        );
      }
    }

    finalMsgId = TagEngine.process(finalMsgId, {
      domain: config.domain,
      email: targetEmail,
      offer_id: config.offerId,
    });

    const encodedSubject = this._encodeHeader(config.sub, config.sencode);
    const encodedFromName = this._encodeHeader(config.from, config.fmencode);

    const context = {
      email: targetEmail,
      domain: config.domain,
      msgId: finalMsgId,
      fromEmail: config.from_email,
      fromName: encodedFromName,
      subject: encodedSubject,
      offer_id: config.offerId,
      html: config.message_html,
      plain: config.message_plain,
    };

    let headers = TagEngine.process(config.headers || "", context);
    let html = TagEngine.process(config.message_html || "", context);

    // Boundary Extraction & Replacement (Standardized)
    const boundaryMatch = headers.match(
      /boundary=(?:"?)(.*?)(?:"?)(?:;|\s|\r|\n|$)/i,
    );
    if (boundaryMatch && boundaryMatch[1]) {
      const boundary = boundaryMatch[1].replace(/['"]/g, "").trim();
      headers = headers.replace(/{{boundary}}/g, boundary);
      html = html.replace(/{{boundary}}/g, boundary);
    }

    const body = `${headers}\r\n\r\n${html}`;

    // Tag Engine Processing for Return Path (Parity with PHP send_fsock.php:185)
    let processedReturnPath = returnPath || config.from_email;
    processedReturnPath = TagEngine.process(processedReturnPath, context);

    const result = await client.send({
      user: authUser,
      pass: authPass,
      from: config.from_email,
      to: targetEmail,
      body: body,
      returnPath: processedReturnPath,
    });

    return result.success;
  }

  async _log(campaignId, text, type) {
    const log = await CampaignLog.create({
      campaign_id: campaignId,
      log_text: text,
      type: type || "info",
    });
    socketService.emitLog(campaignId, log);
  }
}

module.exports = new FsockAutoRunner();
