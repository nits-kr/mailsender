const express = require("express");
const router = express.Router();
const { testSmtp } = require("../controllers/smtpController");
const {
  getSmtpDetails,
  addSmtpDetails,
  deleteSmtpDetails,
} = require("../controllers/smtpDetailsController");
const { protect, admin } = require("../middleware/authMiddleware");

// Legacy test endpoints for tester
router.post("/test", protect, testSmtp);

// SMTP details endpoints mapping to svml.mumara
router
  .route("/details")
  .get(protect, getSmtpDetails)
  .post(protect, addSmtpDetails);
router.delete("/details/:sno", protect, admin, deleteSmtpDetails);

module.exports = router;
