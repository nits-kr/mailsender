const express = require("express");
const {
  sendEmail,
  getCampaigns,
  getCampaignDetails,
  getDefaultIps,
  getCampaignLogs,
} = require("../controllers/emailController");

const router = express.Router();

router.post("/send", sendEmail);
router.get("/campaigns", getCampaigns);
router.get("/campaigns/:id", getCampaignDetails);
router.get("/default-ips", getDefaultIps);
router.get("/logs/:campaignId", getCampaignLogs);

module.exports = router;
