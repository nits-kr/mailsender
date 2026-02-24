const express = require("express");
const router = express.Router();
const {
  createLink,
  getLinks,
  toggleLinkStatus,
  updateMainLink,
} = require("../controllers/linkController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/").post(createLink).get(getLinks);

router.patch("/:id/toggle", toggleLinkStatus);
router.patch("/:id/main_link", updateMainLink);

module.exports = router;
