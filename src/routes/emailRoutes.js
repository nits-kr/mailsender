const express = require("express");
const {
  sendEmail,
  getCampaigns,
  getCampaignDetails,
  getDefaultIps,
  getCampaignLogs,
  clearCampaignLogs,
  getInboxPatterns,
  validateOffer,
  getCampaignStatus,
  startSpaceSending,
  stopSpaceSending,
} = require("../controllers/emailController");

const router = express.Router();

router.post("/send", sendEmail);
router.get("/campaigns", getCampaigns);
router.get("/campaigns/:id", getCampaignDetails);
router.get("/default-ips", getDefaultIps);
router.get("/logs/:campaignId", getCampaignLogs);
router.delete("/logs/:campaignId", clearCampaignLogs);
router.get("/patterns", getInboxPatterns);
router.get("/validate-offer/:offerId", validateOffer);
router.get("/campaign-status/:id", getCampaignStatus);
router.post("/start-space-sending", startSpaceSending);
router.post("/stop-space-sending", stopSpaceSending);

module.exports = router;
