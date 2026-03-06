const express = require("express");
const {
  handleTracking,
  handleOpenPixel,
} = require("../controllers/trackingController");
const router = express.Router();

// Open tracking pixel — must come BEFORE /:pattern catch-all
router.get("/open", handleOpenPixel);

// Public route for tracking (click + redirect)
router.get("/:pattern", handleTracking);

module.exports = router;
