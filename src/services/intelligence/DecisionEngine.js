const IntelligenceLog = require("../../models/IntelligenceLog");
const ReputationScore = require("../../models/ReputationScore");
const Campaign = require("../../models/Campaign"); // Assuming this exists

class DecisionEngine {
  constructor() {
    this.thresholds = {
      inbox_min: 50,
      bounce_max: 5,
      complaint_max: 0.1,
    };
  }

  /**
   * Evaluates if a campaign should be paused based on its recent intelligence logs.
   */
  async evaluateCampaign(campaignId) {
    try {
      // Get the last 100 logs for this campaign to calculate recent placement
      const logs = await IntelligenceLog.find({ campaignId })
        .sort({ timestamp: -1 })
        .limit(100);

      if (logs.length < 10) return; // Not enough data yet

      const inboxCount = logs.filter((l) => l.location === "inbox").length;
      const totalCount = logs.length;
      const inboxScore = (inboxCount / totalCount) * 100;

      console.log(
        `Campaign ${campaignId} Inbox Score: ${inboxScore.toFixed(2)}%`,
      );

      if (inboxScore < this.thresholds.inbox_min) {
        await this.pauseCampaign(
          campaignId,
          `Inbox placement too low: ${inboxScore.toFixed(2)}%`,
        );
      }
    } catch (error) {
      console.error("Decision Engine Evaluation Error:", error);
    }
  }

  async pauseCampaign(campaignId, reason) {
    try {
      // Update campaign status in the database
      // This is a placeholder for the actual Campaign model update
      console.warn(
        `[CIRCUIT BREAKER] Pausing Campaign ${campaignId}. Reason: ${reason}`,
      );

      // await Campaign.findByIdAndUpdate(campaignId, {
      //   status: 'paused',
      //   pauseReason: reason
      // });

      // TODO: Emit socket event or send admin notification
    } catch (error) {
      console.error("Error pausing campaign:", error);
    }
  }

  /**
   * Updates reputation scores for IPs and Domains.
   */
  async updateReputation(assetType, assetValue, location) {
    try {
      let score = await ReputationScore.findOne({ assetType, assetValue });

      if (!score) {
        score = new ReputationScore({ assetType, assetValue });
      }

      score.totalSent += 1;
      if (location === "inbox") score.inboxCount += 1;
      else if (location === "spam") score.spamCount += 1;

      // Recalculate score (sliding window or overall)
      score.inboxScore = (score.inboxCount / score.totalSent) * 100;

      if (score.inboxScore < 40 && score.status !== "paused") {
        score.status = "risky";
      }

      score.lastChecked = new Date();
      await score.save();
    } catch (error) {
      console.error("Reputation Update Error:", error);
    }
  }
}

module.exports = new DecisionEngine();
