const express = require("express");
const {
  getLegacyIP,
  saveLegacyLog,
  updateSuppressionQueue,
  getLegacyCampaignLink,
  getLegacyCampaign,
  sendFsockSmtp,
} = require("../controllers/legacyController");

const router = express.Router();

router.get("/campaign/:id", getLegacyCampaign);
router.get("/ip/:ip", getLegacyIP);
router.post("/log", saveLegacyLog);
router.patch("/suppression-queue/:id", updateSuppressionQueue);
router.get("/campaign-link/:id", getLegacyCampaignLink);
router.post("/fsock-send", sendFsockSmtp);
router.post(
  "/campaign-link-search",
  require("../controllers/legacyController").searchLegacyCampaignLink,
);

module.exports = router;
