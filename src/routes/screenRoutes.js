const express = require("express");
const {
  getScreens,
  getScreenLogs,
  deleteScreen,
  stopScreen,
} = require("../controllers/screenController");

const router = express.Router();

router.get("/", getScreens);
router.get("/:id/logs", getScreenLogs);
router.delete("/:id", deleteScreen);
router.patch("/:id/stop", stopScreen);

module.exports = router;
