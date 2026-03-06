const Link = require("../models/Link");
const Tracking = require("../models/Tracking");
const Campaign = require("../models/Campaign");

// @desc    Handle public click tracking and redirect
// @route   GET /t/:pattern
// @access  Public
const handleTracking = async (req, res) => {
  const { pattern } = req.params;
  const { e } = req.query; // e might be the encoded email/info from the tracking link

  try {
    const link = await Link.findOne({ pattern });

    if (!link || link.status !== 1) {
      return res.status(404).send("Link not found or inactive.");
    }

    // Log the click into Tracking collection
    try {
      await Tracking.create({
        oid: link.own_offerid,
        emailid: e || "unknown",
        category: link.link_type, // 'Sub', 'Unsub', 'Open', 'Opt-out'
        ip: req.ip || req.headers["x-forwarded-for"],
        user_agent: req.headers["user-agent"],
      });
    } catch (saveError) {
      console.error("Failed to save tracking record", saveError);
    }

    let redirectUrl = link.main_link;

    // Pass the email info if present in query
    if (e && redirectUrl.includes("{{e}}")) {
      redirectUrl = redirectUrl.replace("{{e}}", e);
    } else if (e) {
      // Append it as a query param if it's not in the template
      const sep = redirectUrl.includes("?") ? "&" : "?";
      redirectUrl = `${redirectUrl}${sep}e=${e}`;
    }

    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Tracking Error:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// 1x1 transparent GIF (exact bytes)
const PIXEL_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

// @desc    Track email opens via pixel
// @route   GET /t/open
// @access  Public
const handleOpenPixel = async (req, res) => {
  // Serve the transparent pixel immediately (no delay for recipient)
  res.set("Content-Type", "image/gif");
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.send(PIXEL_GIF);

  // Process tracking asynchronously (don't block the response)
  const { cid, e } = req.query;
  if (!cid) return;

  try {
    await Campaign.findByIdAndUpdate(cid, { $inc: { open_count: 1 } });
    await Tracking.create({
      oid: cid,
      emailid: e || "unknown",
      category: "Open",
      ip: req.ip || req.headers["x-forwarded-for"],
      user_agent: req.headers["user-agent"],
    });
  } catch (err) {
    console.error("[Tracking] Open pixel error:", err.message);
  }
};

module.exports = { handleTracking, handleOpenPixel };
