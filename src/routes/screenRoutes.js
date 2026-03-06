const express = require("express");
const {
  getScreens,
  getScreenLogs,
  getCampaignStats,
  deleteScreen,
  stopScreen,
  resumeScreen,
} = require("../controllers/screenController");

const router = express.Router();

router.get("/", getScreens);
router.get("/:id/logs", getScreenLogs);
router.get("/:id/stats", getCampaignStats);
router.delete("/:id", deleteScreen);
router.patch("/:id/stop", stopScreen);
router.patch("/:id/resume", resumeScreen);

module.exports = router;
