const mongoose = require("mongoose");

const MonitoringMailboxSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    host: {
      type: String,
      required: true,
    },
    port: {
      type: Number,
      default: 993,
    },
    tls: {
      type: Boolean,
      default: true,
    },
    provider: {
      type: String,
      enum: ["gmail", "yahoo", "outlook", "other"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastChecked: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("MonitoringMailbox", MonitoringMailboxSchema);
