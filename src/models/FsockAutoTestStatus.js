const mongoose = require("mongoose");

const fsockAutoTestStatusSchema = new mongoose.Schema(
  {
    campaign_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FsockAutoCampaign",
      required: true,
      index: true,
    },
    ip: { type: String, required: true },
    email: { type: String, required: true, index: true },
    msgid: { type: String, required: true, index: true },
    mode: { type: String, default: "Bulk Test" },
    sent_status: { type: Number, default: 0 }, // 1=success, 0=failed
    // Status set by IMAP poller
    status: {
      type: String,
      enum: ["INBOX", "SPAM", null],
      default: null,
    },
  },
  { timestamps: true },
);

fsockAutoTestStatusSchema.index({ campaign_id: 1, msgid: 1 });

module.exports = mongoose.model(
  "FsockAutoTestStatus",
  fsockAutoTestStatusSchema,
);
