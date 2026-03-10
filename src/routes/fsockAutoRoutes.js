const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/fsockAutoController");

// Campaign CRUD
router.post("/campaign", createCampaign);
router.get("/campaigns", getCampaigns);
router.get("/campaign/:id", getCampaign);
router.post("/campaign/:id/stop", stopCampaign);
router.get("/campaign/:id/logs", getCampaignLogs);

// Test status check
router.get("/test-status", checkTestStatus);

// Webhook
router.post("/webhook/:provider", handleWebhook);
router.get("/webhook-stats", getWebhookStats);

// Utility
router.post("/validate-smtp", validateSmtp);
router.get("/file-info/:filename", getDataFileInfo);

module.exports = router;
