const express = require("express");
const {
  sendEmail,
  getCampaigns,
  getCampaignDetails,
  getDefaultIps,
  getCampaignLogs,
  getInboxPatterns,
  validateOffer,
  getCampaignStatus,
} = require("../controllers/emailController");

const router = express.Router();

router.post("/send", sendEmail);
router.get("/campaigns", getCampaigns);
router.get("/campaigns/:id", getCampaignDetails);
router.get("/default-ips", getDefaultIps);
router.get("/logs/:campaignId", getCampaignLogs);
router.get("/patterns", getInboxPatterns);
router.get("/validate-offer/:offerId", validateOffer);
router.get("/campaign-status/:id", getCampaignStatus);

module.exports = router;
