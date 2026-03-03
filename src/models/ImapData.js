const mongoose = require("mongoose");

const ImapDataSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestId",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    subject: String,
    from: String,
    to: String,
    date: Date,
    message_id: {
      type: String,
      index: true,
    },
    uid: {
      type: Number,
      required: true,
      index: true,
    },
    ip: String,
    status: {
      type: String,
      enum: ["INBOX", "SPAM"],
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for finding next messages for a specific account
ImapDataSchema.index({ email: 1, status: 1, uid: -1 });

module.exports = mongoose.model("ImapData", ImapDataSchema);
