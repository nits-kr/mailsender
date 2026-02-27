const express = require("express");
const router = express.Router();
const {
  createLink,
  getLinks,
  toggleLinkStatus,
  updateMainLink,
  getLinkReport,
} = require("../controllers/linkController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/").post(protect, createLink).get(protect, getLinks);

router.patch("/:id/toggle", protect, admin, toggleLinkStatus);
router.patch("/:id/main_link", protect, admin, updateMainLink);
router.get("/:own_offerid/report", protect, getLinkReport);

module.exports = router;
