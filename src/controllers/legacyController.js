const CampaignTemplate = require("../models/CampaignTemplate");
const IP = require("../models/IP");
const CampaignLog = require("../models/CampaignLog");
const Campaign = require("../models/Campaign");
const OfferSuppQueue = require("../models/OfferSuppQueue");

// @desc    Get campaign for legacy PHP script
// @route   GET /api/legacy/campaign/:id
const getLegacyCampaign = async (req, res) => {
  try {
    // Try to find by MongoDB ID first, then by legacy mysql_sno
    let campaign = await CampaignTemplate.findById(req.params.id);
    if (!campaign) {
      campaign = await CampaignTemplate.findOne({ mysql_sno: req.params.id });
    }

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Map to a structure similar to what mysql_fetch_array would return
    res.json(campaign);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching campaign", error: error.message });
  }
};

// @desc    Get IP/SMTP details for legacy PHP script
// @route   GET /api/legacy/ip/:ip
const getLegacyIP = async (req, res) => {
  try {
    const ipData = await IP.findOne({ ip: req.params.ip });
    if (!ipData) {
      return res.status(404).json({ message: "IP not found" });
    }
    res.json(ipData);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching IP data", error: error.message });
  }
};

// @desc    Save log from legacy PHP script
// @route   POST /api/legacy/log
const saveLegacyLog = async (req, res) => {
  const { campaign_id, log_text, type } = req.body;
  try {
    const log = await CampaignLog.create({
      campaign_id,
      log_text,
      type: type || "info",
    });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: "Error saving log", error: error.message });
  }
};

// @desc    Update suppression queue status (legacy)
// @route   PATCH /api/legacy/suppression-queue/:id
const updateSuppressionQueue = async (req, res) => {
  try {
    const queueItem = await OfferSuppQueue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!queueItem) {
      return res.status(404).json({ message: "Queue item not found" });
    }
    res.json(queueItem);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating queue", error: error.message });
  }
};

// @desc    Get campaign link for legacy PHP script
// @route   GET /api/legacy/campaign-link/:id
const getLegacyCampaignLink = async (req, res) => {
  try {
    const campaign = await CampaignTemplate.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    // Return just the in_link field or standard link
    res.json({ in_link: campaign.in_link || "" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching link", error: error.message });
  }
};

// @desc    Search campaign link by metadata (legacy)
// @route   POST /api/legacy/campaign-link-search
const searchLegacyCampaignLink = async (req, res) => {
  const { subject, ip, domain, offer } = req.body;
  try {
    const campaign = await CampaignTemplate.findOne({
      name: subject, // mapping subject to name in Mongo
      ip: ip,
      domain: domain,
      offer_id: offer,
    });
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    res.json({ in_link: campaign.in_link || "" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching link", error: error.message });
  }
};

module.exports = {
  getLegacyCampaign,
  getLegacyIP,
  saveLegacyLog,
  updateSuppressionQueue,
  getLegacyCampaignLink,
  searchLegacyCampaignLink,
};
