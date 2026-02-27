const Link = require("../models/Link");
const Offer = require("../models/Offer");
const Tracking = require("../models/Tracking");

// @desc    Create a new redirectional link
// @route   POST /api/links
// @access  Private
const createLink = async (req, res) => {
  const {
    offer_master_id,
    domain,
    link_type,
    own_offerid,
    pattern,
    main_link,
    generated_link,
  } = req.body;

  try {
    const link = await Link.create({
      offer_master_id,
      domain,
      link_type,
      own_offerid,
      pattern,
      main_link,
      generated_link,
      sender: req.user._id,
      sender_name: req.user.username,
    });

    res.status(201).json(link);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating link", error: error.message });
  }
};

// @desc    Get all links (paginated or filtered)
// @route   GET /api/links
// @access  Private
const getLinks = async (req, res) => {
  try {
    const links = await Link.find({})
      .populate("offer_master_id", "offer_name affiliate")
      .sort({ createdAt: -1 });
    res.json(links);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching links", error: error.message });
  }
};

// @desc    Toggle link status
// @route   PATCH /api/links/:id/toggle
// @access  Private/Admin
const toggleLinkStatus = async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) return res.status(404).json({ message: "Link not found" });

    link.status = link.status === 1 ? 0 : 1;
    await link.save();
    res.json(link);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error toggling status", error: error.message });
  }
};

// @desc    Update main redirect link
// @route   PATCH /api/links/:id/main_link
// @access  Private/Admin
const updateMainLink = async (req, res) => {
  const { main_link } = req.body;
  try {
    const link = await Link.findById(req.params.id);
    if (!link) return res.status(404).json({ message: "Link not found" });

    link.main_link = main_link;
    await link.save();
    res.json(link);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating main link", error: error.message });
  }
};

// @desc    Get tracking report for a link
// @route   GET /api/links/:own_offerid/report
// @access  Private
const getLinkReport = async (req, res) => {
  const { own_offerid } = req.params;
  try {
    const totalCount = await Tracking.countDocuments({ oid: own_offerid });

    // For unique count, we distinct by emailid
    const distinctEmails = await Tracking.distinct("emailid", {
      oid: own_offerid,
    });
    const uniqueCount = distinctEmails.length;

    res.json({ total: totalCount, unique: uniqueCount });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching report", error: error.message });
  }
};

module.exports = {
  createLink,
  getLinks,
  toggleLinkStatus,
  updateMainLink,
  getLinkReport,
};
