const express = require("express");
const router = express.Router();
const IntelligenceLog = require("../models/IntelligenceLog");
const ReputationScore = require("../models/ReputationScore");

// Get overall intelligence stats
router.get("/stats", async (req, res) => {
  console.log("[DEBUG] Hit /api/intelligence/stats");
  try {
    const totalLogs = await IntelligenceLog.countDocuments();
    const inboxCount = await IntelligenceLog.countDocuments({
      location: "inbox",
    });

    const globalInboxRate = totalLogs > 0 ? (inboxCount / totalLogs) * 100 : 0;

    const riskyAssets = await ReputationScore.countDocuments({
      status: { $ne: "healthy" },
    });

    res.json({
      globalInboxRate: globalInboxRate.toFixed(2),
      totalTests: totalLogs,
      riskyAssets,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get IP health
router.get("/ip-health", async (req, res) => {
  try {
    const scores = await ReputationScore.find({ assetType: "ip" }).sort({
      lastChecked: -1,
    });
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Domain health
router.get("/domain-health", async (req, res) => {
  try {
    const scores = await ReputationScore.find({ assetType: "domain" }).sort({
      lastChecked: -1,
    });
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
