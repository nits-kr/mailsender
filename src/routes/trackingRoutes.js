const express = require("express");
const {
  handleTracking,
  handleOpenPixel,
} = require("../controllers/trackingController");
const router = express.Router();

// Open tracking pixel (Path routing to bypass proxies)
router.get("/open/:cid/:e", handleOpenPixel);

// Open tracking pixel (Legacy fallback)
router.get("/open", handleOpenPixel);

// Public route for tracking (click + redirect)
router.get("/:pattern", handleTracking);

module.exports = router;
