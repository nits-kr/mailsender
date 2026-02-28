const mongoose = require("mongoose");

const IntelligenceLogSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ["gmail", "yahoo", "outlook", "other"],
      required: true,
      index: true,
    },
    location: {
      type: String,
      enum: ["inbox", "spam", "missing"],
      required: true,
    },
    testEmail: {
      type: String,
      required: true,
    },
    subject: String,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient reporting
IntelligenceLogSchema.index({ campaignId: 1, provider: 1, timestamp: -1 });

module.exports = mongoose.model("IntelligenceLog", IntelligenceLogSchema);
