const mongoose = require("mongoose");

const ReputationScoreSchema = new mongoose.Schema(
  {
    assetType: {
      type: String,
      enum: ["ip", "domain"],
      required: true,
      index: true,
    },
    assetValue: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    inboxScore: {
      type: Number,
      default: 100, // 0-100 scale
      min: 0,
      max: 100,
    },
    bounceRate: {
      type: Number,
      default: 0,
    },
    complaintRate: {
      type: Number,
      default: 0,
    },
    totalSent: {
      type: Number,
      default: 0,
    },
    inboxCount: {
      type: Number,
      default: 0,
    },
    spamCount: {
      type: Number,
      default: 0,
    },
    isRecoveryMode: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["healthy", "risky", "paused"],
      default: "healthy",
    },
    lastChecked: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ReputationScore", ReputationScoreSchema);
