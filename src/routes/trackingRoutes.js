const express = require("express");
const { handleTracking } = require("../controllers/trackingController");
const router = express.Router();

// Public route for tracking
router.get("/:pattern", handleTracking);

module.exports = router;
