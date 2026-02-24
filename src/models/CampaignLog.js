const mongoose = require("mongoose");

const campaignLogSchema = mongoose.Schema({
  campaign_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign",
    required: true,
  },
  log_text: { type: String, required: true },
  type: { type: String, enum: ["info", "success", "error"], default: "info" },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CampaignLog", campaignLogSchema);
