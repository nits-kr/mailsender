const Campaign = require("../models/Campaign");
const CampaignLog = require("../models/CampaignLog");

// @desc    Get all campaigns (Screens)
// @route   GET /api/screens
const getScreens = async (req, res) => {
  try {
    const screens = await Campaign.find().sort({ createdAt: -1 });
    res.json(screens);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching screens", error: error.message });
  }
};

// @desc    Get logs for a specific campaign
// @route   GET /api/screens/:id/logs
const getScreenLogs = async (req, res) => {
  try {
    const logs = await CampaignLog.find({ campaign_id: req.params.id })
      .sort({ created_at: -1 })
      .limit(500);
    res.json(logs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching screen logs", error: error.message });
  }
};

// @desc    Delete a campaign (Screen)
// @route   DELETE /api/screens/:id
const deleteScreen = async (req, res) => {
  try {
    await Campaign.findByIdAndDelete(req.params.id);
    await CampaignLog.deleteMany({ campaign_id: req.params.id });
    res.json({ message: "Screen deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting screen", error: error.message });
  }
};

// @desc    Stop a campaign (Screen)
// @route   PATCH /api/screens/:id/stop
const stopScreen = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { status: "Stopped" },
      { new: true },
    );
    // Note: This won't remove jobs from BullMQ, but the worker will check the status
    res.json({
      message: "Screen stopped successfully",
      status: campaign.status,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error stopping screen", error: error.message });
  }
};

module.exports = { getScreens, getScreenLogs, deleteScreen, stopScreen };
