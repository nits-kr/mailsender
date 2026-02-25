const Link = require("../models/Link");
// We can use Log or create a more specific ClickLog
const Log = require("../models/Log");

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

    // Optional: Log the click
    // For now we use the general Log model or we could create a new ClickLog
    // For simplicity, let's just redirect for now as the user wants
    // "exactly same feature" and we need to verify where PHP logged clicks.

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

module.exports = { handleTracking };
