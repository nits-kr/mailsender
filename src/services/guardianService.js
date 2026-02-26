const Campaign = require("../models/Campaign");
const CampaignLog = require("../models/CampaignLog");

/**
 * guardianService.js
 * "Campaign Guardian" — real-time monitoring and auto-pause safety system.
 */

const evaluate = async (campaignId) => {
  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign || campaign.status !== "Running") return;

    const {
      success_count,
      error_count,
      bounce_count,
      complaint_count,
      inbox_count,
      spam_count,
      total_emails,
      guardian_settings,
    } = campaign;

    const sent = success_count + error_count;
    if (sent < 50) return; // Wait for a baseline of 50 emails before triggering auto-pause

    const received = inbox_count + spam_count; // Total detected by IMAP

    // 1. Spam Rate Threshold (Spam / Total IMAP detections)
    if (received >= 5) {
      // Need at least 5 TestID detections to determine trend
      const spamRate = (spam_count / received) * 100;
      if (spamRate > guardian_settings.spam_threshold) {
        return await autoPause(
          campaign,
          "Spam Threshold Breach",
          `Spam rate is ${spamRate.toFixed(2)}%, exceeding threshold of ${guardian_settings.spam_threshold}%`,
        );
      }
    }

    // 2. Bounce Rate (Bounces / Total Sent)
    const bounceRate = (error_count / sent) * 100; // Using error_count as proxy for bounce for now
    if (bounceRate > guardian_settings.bounce_threshold) {
      return await autoPause(
        campaign,
        "Bounce Rate Spike",
        `Bounce/Error rate is ${bounceRate.toFixed(2)}%, exceeding threshold of ${guardian_settings.bounce_threshold}%`,
      );
    }

    // 3. Complaint Rate (Complaints / Total Sent)
    if (sent > 100) {
      const complaintRate = (complaint_count / sent) * 100;
      if (complaintRate > guardian_settings.complaint_threshold) {
        return await autoPause(
          campaign,
          "Complaint Alert",
          `Complaint rate is ${complaintRate.toFixed(2)}%, exceeding threshold of ${guardian_settings.complaint_threshold}%`,
        );
      }
    }

    // 4. Deliverability Drop (Last 20 results vs Overall)
    if (received > 40) {
      // Enough data to detect a shift
      // Get last 20 IMAP-identified logs for this campaign
      const recentLogs = await CampaignLog.find({
        campaign_id: campaignId,
        $or: [{ inbox: 1 }, { spam: 1 }],
      })
        .sort({ created_at: -1 })
        .limit(20);

      if (recentLogs.length >= 15) {
        const recentInboxCount = recentLogs.filter((l) => l.inbox === 1).length;
        const recentInboxRate = (recentInboxCount / recentLogs.length) * 100;
        const overallInboxRate = (inbox_count / received) * 100;

        const drop = overallInboxRate - recentInboxRate;
        if (drop >= guardian_settings.drop_threshold) {
          return await autoPause(
            campaign,
            "Deliverability Drop",
            `Inbox placement dropped by ${drop.toFixed(1)}% recently (${recentInboxRate.toFixed(1)}% vs ${overallInboxRate.toFixed(1)}% overall)`,
          );
        }
      }
    }
  } catch (error) {
    console.error("Guardian evaluation error:", error);
  }
};

const autoPause = async (campaign, event, message) => {
  console.log(
    `[GUARDIAN] Auto-pausing campaign ${campaign._id}: ${event} - ${message}`,
  );

  // 1. Update Campaign Status
  campaign.status = "Stopped";
  campaign.guardian_logs.push({ event, message });
  await campaign.save();

  // 2. Log to CampaignLogs
  await CampaignLog.create({
    campaign_id: campaign._id,
    log_text: `🚨 [CAMPAIGN GUARDIAN] AUTO-PAUSED! ${event}: ${message}`,
    type: "error",
    mail_status: "SYSTEM GUARD",
    sent: campaign.success_count + campaign.error_count,
    inbox: campaign.inbox_count,
    spam: campaign.spam_count,
    received: campaign.inbox_count + campaign.spam_count,
  });

  return true;
};

module.exports = { evaluate };
