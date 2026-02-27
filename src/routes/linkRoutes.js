const express = require("express");
const router = express.Router();
const {
  createLink,
  getLinks,
  toggleLinkStatus,
  updateMainLink,
} = require("../controllers/linkController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/").post(protect, createLink).get(protect, getLinks);

router.patch("/:id/toggle", protect, admin, toggleLinkStatus);
router.patch("/:id/main_link", protect, admin, updateMainLink);

module.exports = router;
