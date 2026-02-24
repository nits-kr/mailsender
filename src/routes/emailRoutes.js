const express = require("express");
const {
  sendEmail,
  getCampaigns,
  getCampaignDetails,
} = require("../controllers/emailController");

const router = express.Router();

router.post("/send", sendEmail);
router.get("/campaigns", getCampaigns);
router.get("/campaigns/:id", getCampaignDetails);

module.exports = router;
