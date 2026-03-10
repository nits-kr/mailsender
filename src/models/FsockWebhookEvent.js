const mongoose = require("mongoose");

const fsockWebhookEventSchema = new mongoose.Schema(
  {
    account: { type: String, required: true, index: true },
    provider: { type: String, default: "sendgrid" },
    event_type: { type: String, required: true, index: true }, // bounce, click, open, spam etc
    email: { type: String, required: true },
    raw_payload: { type: mongoose.Schema.Types.Mixed },
    event_date: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

fsockWebhookEventSchema.index({ account: 1, event_type: 1, event_date: -1 });

module.exports = mongoose.model("FsockWebhookEvent", fsockWebhookEventSchema);
