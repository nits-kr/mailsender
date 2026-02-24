const express = require("express");
const router = express.Router();
const { testSmtp } = require("../controllers/smtpController");
const { protect } = require("../middleware/authMiddleware");

router.post("/test", protect, testSmtp);

module.exports = router;
