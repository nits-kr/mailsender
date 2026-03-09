/**
 * CampaignAutoRunner service
 * Handles BULK + AUTO mode: sends emails in batches, monitors inbox placement,
 * rotates IPs, and auto-pauses if reputation drops.
 */

const Campaign = require("../models/Campaign");
const CampaignLog = require("../models/CampaignLog");
const ReputationScore = require("../models/ReputationScore");
const { emailQueue } = require("../queues/emailQueue");
const socketService = require("./socketService");

// Import email queueing helper (copied pattern from emailController)
const crypto = require("crypto");
const TagEngine = require("../utils/tagEngine");
const { generateMessageId } = require("../utils/patternGenerator");

const sleep = (seconds) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

const buildReplaceTags = (email, opts) => {
  const { from_email, from_name, offer_id, domain, search_replace, msgId } =
    opts;
  const dateNow = new Date();
  const dateStr = dateNow.toLocaleDateString("en-GB").replace(/\//g, "-");
  const datetimeStr = dateNow.toUTCString();
  const emailDomain = email.split("@")[1] || "";
  const nameTag = emailDomain.replace(/[._-]/g, "").replace(/[0-9]/g, "");
  return (text) => {
    if (!text) return "";
    let p = text
      .replace(/{{?email}}?/g, email)
      .replace(/{{?name}}?/g, nameTag)
      .replace(/{{?fromid}}?/g, from_email)
      .replace(/{{?fromname}}?/g, from_name)
      .replace(/{{?datetime}}?/g, datetimeStr)
      .replace(/{{?date}}?/g, dateStr)
      .replace(/{{?msgid}}?/g, msgId || "")
      .replace(/{{?domain}}?/g, domain || "");
    p = TagEngine.process(p, { email, domain, offer_id, msgId });
    return p;
  };
};

class CampaignAutoRunner {
  constructor() {
    this.runningCampaigns = new Map(); // campaignId -> { stop: bool }
  }

  /**
   * Start the auto runner for a campaign
   */
  start({
    campaignId,
    emailsList,
    ipPool,
    emailOpts,
    batchSize,
    sleepSeconds,
    inboxPercentThreshold, // user-defined inbox_percent field
    startIndex,
  }) {
    const handle = { stop: false };
    this.runningCampaigns.set(String(campaignId), handle);

    this._run({
      campaignId,
      emailsList,
      ipPool,
      emailOpts,
      batchSize,
      sleepSeconds,
      inboxPercentThreshold: Number(inboxPercentThreshold) || 50,
      handle,
      startIndex: Number(startIndex) || 0,
    }).catch((err) => {
      console.error(`[AutoRunner] Campaign ${campaignId} error:`, err);
    });
  }

  stop(campaignId) {
    const handle = this.runningCampaigns.get(String(campaignId));
    if (handle) {
      handle.stop = true;
      this.runningCampaigns.delete(String(campaignId));
    }
  }

  async _run({
    campaignId,
    emailsList,
    ipPool,
    emailOpts,
    batchSize,
    sleepSeconds,
    inboxPercentThreshold,
    handle,
    startIndex,
  }) {
    let currentOffset = startIndex;
    let totalQueuedInRunner = 0;

    const batches = [];
    for (let i = 0; i < emailsList.length; i += batchSize) {
      batches.push(emailsList.slice(i, i + batchSize));
    }

    for (let batchNum = 0; batchNum < batches.length; batchNum++) {
      if (handle.stop) {
        const stopLog = await CampaignLog.create({
          campaign_id: campaignId,
          log_text: `[BULK+AUTO] Runner stopped manually at batch ${batchNum + 1}.`,
          type: "info",
        });
        socketService.emitLog(campaignId, stopLog);
        break;
      }

      const campaign = await Campaign.findById(campaignId);
      if (!campaign || campaign.status === "Stopped") {
        const haltLog = await CampaignLog.create({
          campaign_id: campaignId,
          log_text: `[BULK+AUTO] Campaign stopped or not found. Halting AutoRunner.`,
          type: "info",
        });
        socketService.emitLog(campaignId, haltLog);
        break;
      }

      // 1. Reputation check & Weight calculation
      // We check for all IPs and build a weighted pool
      const poolWithRep = [];
      let totalWeight = 0;

      for (const entry of ipPool) {
        let rep = await ReputationScore.findOne({ assetValue: entry.ip });
        // Use default 100 for new IPs, or use their actual score
        const score = rep ? rep.inboxScore : 100;
        const status = rep ? rep.status : "healthy";

        if (status !== "paused") {
          // Weight is the inboxScore (e.g. 90% = 90 weight)
          // Minimum weight of 1 to ensure some traffic if score is very low but not paused
          const weight = Math.max(1, score);
          poolWithRep.push({ entry, weight, score });
          totalWeight += weight;
        }
      }

      if (poolWithRep.length === 0) {
        await Campaign.findByIdAndUpdate(campaignId, { status: "Stopped" });
        const zeroRepLog = await CampaignLog.create({
          campaign_id: campaignId,
          log_text: `[BULK+AUTO] All IPs are paused or have 0 reputation. Campaign auto-stopped.`,
          type: "error",
        });
        socketService.emitLog(campaignId, zeroRepLog);
        break;
      }

      // Sort by score for logging
      poolWithRep.sort((a, b) => b.score - a.score);

      if (poolWithRep.length < ipPool.length) {
        const removedIps = ipPool
          .filter((e) => !poolWithRep.find((p) => p.entry.ip === e.ip))
          .map((e) => e.ip)
          .join(", ");
        if (removedIps) {
          const removedIpsLog = await CampaignLog.create({
            campaign_id: campaignId,
            log_text: `[BULK+AUTO] Reputation guard active. IPs removed: ${removedIps}.`,
            type: "info",
          });
          socketService.emitLog(campaignId, removedIpsLog);
        }
      }

      // 2. Domain reputation check
      const domRep = await ReputationScore.findOne({
        assetValue: campaign.domain,
        status: "paused",
      });
      if (domRep) {
        await Campaign.findByIdAndUpdate(campaignId, { status: "Stopped" });
        const domRepLog = await CampaignLog.create({
          campaign_id: campaignId,
          log_text: `[BULK+AUTO] Domain ${campaign.domain} reputation paused. Campaign auto-stopped.`,
          type: "error",
        });
        socketService.emitLog(campaignId, domRepLog);
        break;
      }

      // 3. Inbox Placement Rate Check (Campaign-wide safety jump)
      if (campaign.success_count > 10) {
        const currentInboxRate =
          campaign.inbox_count > 0
            ? (campaign.inbox_count / campaign.success_count) * 100
            : 0;
        if (currentInboxRate < inboxPercentThreshold) {
          await Campaign.findByIdAndUpdate(campaignId, { status: "Stopped" });
          const dropLog = await CampaignLog.create({
            campaign_id: campaignId,
            log_text: `[BULK+AUTO] Overall Inbox rate ${currentInboxRate.toFixed(1)}% dropped below threshold ${inboxPercentThreshold}%. Auto-stopping.`,
            type: "error",
          });
          socketService.emitLog(campaignId, dropLog);
          break;
        }
      }

      // 4. Queue Batch using Weighted Selection
      const batch = batches[batchNum];
      const stats = {}; // Tracking distribution for logging

      for (const email of batch) {
        // Weighted Random Selection
        let random = Math.random() * totalWeight;
        let selected = poolWithRep[0];
        for (const item of poolWithRep) {
          if (random < item.weight) {
            selected = item;
            break;
          }
          random -= item.weight;
        }

        const entry = selected.entry;
        stats[entry.ip] = (stats[entry.ip] || 0) + 1;

        // 1. Determine/Generate Message-ID for this specific email
        let finalMsgId = emailOpts.message_id || "";
        if (!finalMsgId) {
          finalMsgId = generateMessageId(1, campaign.domain || "localhost");
        } else if (!isNaN(finalMsgId) && finalMsgId.length < 3) {
          finalMsgId = generateMessageId(
            finalMsgId,
            campaign.domain || "localhost",
          );
        }
        // Process MsgID itself through TagEngine
        finalMsgId = TagEngine.process(finalMsgId, {
          email,
          domain: campaign.domain,
          offer_id: emailOpts.offer_id,
        });

        const replaceTags = buildReplaceTags(email.trim(), {
          ...emailOpts,
          msgId: finalMsgId,
        });
        const resolvedFromName = entry.from_name || emailOpts.from_name;
        const resolvedFromEmail = entry.from_email || emailOpts.from_email;

        await emailQueue.add("send-email", {
          campaign_id: campaignId,
          from_email: resolvedFromEmail,
          from_name: replaceTags(resolvedFromName),
          mailing_ip: entry.ip,
          headers: replaceTags(emailOpts.headers),
          subject: replaceTags(emailOpts.subject),
          body_html: replaceTags(emailOpts.message_html),
          body_plain: replaceTags(emailOpts.message_plain),
          email: email.trim(),
          mode: emailOpts.mode,
          subject_enc: emailOpts.subject_enc,
          from_enc: emailOpts.from_enc,
          msg_type: emailOpts.msg_type,
          charset: emailOpts.charset,
          encoding: emailOpts.encoding,
          charset_alt: emailOpts.charset_alt,
          encoding_alt: emailOpts.encoding_alt,
          msgId: finalMsgId, // Pass pre-generated ID
          reply_to: emailOpts.reply_to,
          xmailer: emailOpts.xmailer,
          offer_id: emailOpts.offer_id,
          wait_time: emailOpts.wait_time,
          dashboardLogId: emailOpts.dashboardLogId,
        });
      }

      totalQueuedInRunner += batch.length;
      currentOffset += batch.length;

      await Campaign.findByIdAndUpdate(campaignId, {
        total_queued: currentOffset,
      });

      const distLog = Object.entries(stats)
        .map(([ip, count]) => `${ip}: ${count}`)
        .join(", ");
      const batchLog = await CampaignLog.create({
        campaign_id: campaignId,
        log_text: `[BULK+AUTO] Batch ${batchNum + 1}/${batches.length}: Queued ${batch.length} emails. Weighted Distribution -> ${distLog}. Sleeping ${sleepSeconds}s...`,
        type: "info",
      });
      socketService.emitLog(campaignId, batchLog);

      if (batchNum < batches.length - 1) {
        await sleep(sleepSeconds);
      }
    }

    // Mark campaign complete if we finished all batches
    let finalCampaign = await Campaign.findById(campaignId);
    if (finalCampaign && finalCampaign.status !== "Stopped") {
      finalCampaign = await Campaign.findByIdAndUpdate(
        campaignId,
        { status: "Completed", end_time: new Date() },
        { new: true },
      );
      const endLog = await CampaignLog.create({
        campaign_id: campaignId,
        log_text: `[BULK+AUTO] AutoRunner finished. Total runner-queued: ${totalQueuedInRunner}. Final Offset: ${currentOffset}.`,
        type: "success",
      });
      socketService.emitLog(campaignId, endLog, finalCampaign);
    }

    this.runningCampaigns.delete(String(campaignId));
  }
}

module.exports = new CampaignAutoRunner();
