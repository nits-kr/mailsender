const express = require("express");
const {
  getImapScreens,
  stopImapScreen,
  deleteImapScreen,
  getImapLogs,
  createImapScreen,
  restartImapScreen,
} = require("../controllers/imapScreenController");

const router = express.Router();

router.get("/", getImapScreens);
router.get("/logs/:name", getImapLogs);
router.post("/stop/:name", stopImapScreen);
router.post("/restart", restartImapScreen);
router.delete("/:name", deleteImapScreen);
router.post("/create", createImapScreen);

module.exports = router;
