/**
 * CampaignAutoRunner service
 * Handles BULK + AUTO mode: sends emails in batches, monitors inbox placement,
 * rotates IPs, and auto-pauses if reputation drops.
 */

const Campaign = require("../models/Campaign");
const CampaignLog = require("../models/CampaignLog");
const ReputationScore = require("../models/ReputationScore");
const { emailQueue } = require("../queues/emailQueue");

// Import email queueing helper (copied pattern from emailController)
const crypto = require("crypto");
const TagEngine = require("../utils/tagEngine");

const sleep = (seconds) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

const buildReplaceTags = (email, opts) => {
  const { from_email, from_name, offer_id, domain, msgId, search_replace } =
    opts;
  const dateNow = new Date();
  const dateStr = dateNow.toLocaleDateString("en-GB").replace(/\//g, "-");
  const datetimeStr = dateNow.toUTCString();
  const emailDomain = email.split("@")[1] || "";
  const nameTag = emailDomain.replace(/[._-]/g, "").replace(/[0-9]/g, "");
  return (text) => {
    if (!text) return "";
    let p = text
      .replace(/{email}/g, email)
      .replace(/{name}/g, nameTag)
      .replace(/{fromid}/g, from_email)
      .replace(/{fromname}/g, from_name)
      .replace(/{datetime}/g, datetimeStr)
      .replace(/{date}/g, dateStr)
      .replace(/{msgid}/g, msgId)
      .replace(/{domain}/g, domain || "");
    p = TagEngine.process(p, { email, domain, offer_id });
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
  }) {
    let pIdx = 0;
    let totalQueued = 0;

    const batches = [];
    for (let i = 0; i < emailsList.length; i += batchSize) {
      batches.push(emailsList.slice(i, i + batchSize));
    }

    for (let batchNum = 0; batchNum < batches.length; batchNum++) {
      if (handle.stop) {
        await CampaignLog.create({
          campaign_id: campaignId,
          log_text: `[BULK+AUTO] Runner stopped manually at batch ${batchNum + 1}.`,
          type: "info",
        });
        break;
      }

      const campaign = await Campaign.findById(campaignId);
      if (!campaign || campaign.status === "Stopped") {
        await CampaignLog.create({
          campaign_id: campaignId,
          log_text: `[BULK+AUTO] Campaign stopped or not found. Halting AutoRunner.`,
          type: "info",
        });
        break;
      }

      // Reputation check: remove paused IPs from pool for this batch
      const activePool = [];
      for (const entry of ipPool) {
        const rep = await ReputationScore.findOne({ assetValue: entry.ip });
        if (!rep || rep.status !== "paused") {
          activePool.push(entry);
        }
      }

      if (activePool.length === 0) {
        await Campaign.findByIdAndUpdate(campaignId, { status: "Stopped" });
        await CampaignLog.create({
          campaign_id: campaignId,
          log_text: `[BULK+AUTO] All IPs are paused. Campaign auto-stopped to protect domain reputation.`,
          type: "error",
        });
        break;
      }

      if (activePool.length < ipPool.length) {
        const removedIps = ipPool
          .filter((e) => !activePool.includes(e))
          .map((e) => e.ip)
          .join(", ");
        await CampaignLog.create({
          campaign_id: campaignId,
          log_text: `[BULK+AUTO] Reputation guard removed IPs: ${removedIps}. Continuing with ${activePool.length} healthy IP(s).`,
          type: "info",
        });
      }

      // Domain reputation check
      const domRep = await ReputationScore.findOne({
        assetValue: campaign.domain,
        status: "paused",
      });
      if (domRep) {
        await Campaign.findByIdAndUpdate(campaignId, { status: "Stopped" });
        await CampaignLog.create({
          campaign_id: campaignId,
          log_text: `[BULK+AUTO] Domain ${campaign.domain} reputation paused. Campaign auto-stopped.`,
          type: "error",
        });
        break;
      }

      // ── Inbox Placement Rate Check (user-defined inbox_percent threshold) ─
      if (campaign.success_count > 10) {
        // only check after meaningful sample
        const currentInboxRate =
          campaign.inbox_count > 0
            ? (campaign.inbox_count / campaign.success_count) * 100
            : 0;
        if (currentInboxRate < inboxPercentThreshold) {
          await Campaign.findByIdAndUpdate(campaignId, { status: "Stopped" });
          await CampaignLog.create({
            campaign_id: campaignId,
            log_text: `[BULK+AUTO] Inbox rate ${currentInboxRate.toFixed(1)}% dropped below threshold ${inboxPercentThreshold}%. Campaign auto-stopped.`,
            type: "error",
          });
          break;
        }
      }

      // Queue this batch with active pool round-robin
      const batch = batches[batchNum];
      for (const email of batch) {
        const entry = activePool[pIdx % activePool.length];
        pIdx++;

        const msgId = `<${crypto.randomBytes(16).toString("hex")}@${emailOpts.domain || "localhost"}>`;
        const replaceTags = buildReplaceTags(email.trim(), {
          ...emailOpts,
          msgId,
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
          msgId,
          reply_to: emailOpts.reply_to,
          xmailer: emailOpts.xmailer,
          offer_id: emailOpts.offer_id,
        });
      }

      totalQueued += batch.length;
      await Campaign.findByIdAndUpdate(campaignId, {
        total_queued: totalQueued,
      });

      await CampaignLog.create({
        campaign_id: campaignId,
        log_text: `[BULK+AUTO] Batch ${batchNum + 1}/${batches.length}: Queued ${batch.length} emails via ${activePool.length} IP(s). Total queued: ${totalQueued}. Sleeping ${sleepSeconds}s...`,
        type: "info",
      });

      if (batchNum < batches.length - 1) {
        await sleep(sleepSeconds);
      }
    }

    // Mark campaign complete
    await Campaign.findByIdAndUpdate(campaignId, {
      status: "Completed",
      end_time: new Date(),
    });
    await CampaignLog.create({
      campaign_id: campaignId,
      log_text: `[BULK+AUTO] AutoRunner complete. Total emails queued: ${totalQueued}.`,
      type: "success",
    });

    this.runningCampaigns.delete(String(campaignId));
  }
}

module.exports = new CampaignAutoRunner();
