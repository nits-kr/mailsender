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
  // Structured stats for terminal log display
  sent: { type: Number, default: 0 }, // total sent so far at time of this log
  inbox: { type: Number, default: 0 }, // IMAP inbox count
  spam: { type: Number, default: 0 }, // IMAP spam count
  promo: { type: Number, default: 0 }, // IMAP promotions tab count
  social: { type: Number, default: 0 }, // IMAP social tab count
  updates: { type: Number, default: 0 }, // IMAP updates tab count
  received: { type: Number, default: 0 }, // IMAP total received count
  mail_status: { type: String, default: "" }, // e.g. "email@x.com success"
  inbox_percent: { type: Number, default: 0 },
  fingerprint: { type: String, default: "" }, // unique per sent message for IMAP reconciliation
});

// Database Indexes for High-Scale IMAP Scanning
// Without these, looking up untested logs (inbox=0/spam=0) scans the entire DB.
campaignLogSchema.index({
  campaign_id: 1,
  type: 1,
  mail_status: 1,
  inbox: 1,
  spam: 1,
  promo: 1,
  social: 1,
  updates: 1,
});
campaignLogSchema.index({
  campaign_id: 1,
  type: 1,
  fingerprint: 1,
  inbox: 1,
  spam: 1,
  promo: 1,
  social: 1,
  updates: 1,
});

module.exports = mongoose.model("CampaignLog", campaignLogSchema);

