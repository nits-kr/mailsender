const mongoose = require("mongoose");

const campaignLogSchema = mongoose.Schema(
  {
    campaign_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    log_text: { type: String, required: true },
    type: { type: String, enum: ["info", "success", "error"], default: "info" },
    created_at: { type: Date, default: Date.now },
    // Structured stats for terminal log display
    sent: { type: Number, default: 0 }, // total sent so far at time of this log
    inbox: { type: Number, default: 0 }, // IMAP inbox count
    spam: { type: Number, default: 0 }, // IMAP spam count
    promo: { type: Number, default: 0 }, // IMAP promo/promotions count
    received: { type: Number, default: 0 }, // IMAP received count
    mail_status: { type: String, default: "" }, // e.g. "email@x.com success"
    inbox_percent: { type: Number, default: 0 },
    fingerprint: { type: String, default: "" }, // unique per sent message for IMAP reconciliation
  },
  { timestamps: true },
);

// Database Indexes for High-Scale IMAP Scanning
campaignLogSchema.index({
  campaign_id: 1,
  type: 1,
  mail_status: 1,
  inbox: 1,
  spam: 1,
  promo: 1,
});
campaignLogSchema.index({
  campaign_id: 1,
  type: 1,
  fingerprint: 1,
  inbox: 1,
  spam: 1,
  promo: 1,
});

module.exports = mongoose.model("CampaignLog", campaignLogSchema);
