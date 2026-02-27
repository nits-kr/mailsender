const mongoose = require("mongoose");

const trackingSchema = mongoose.Schema(
  {
    oid: {
      type: String,
      required: true,
      index: true,
    },
    emailid: {
      type: String,
    },
    category: {
      type: String, // 'Open', 'Sub', 'Unsub', 'Opt-out'
    },
    ip: {
      type: String,
    },
    user_agent: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Tracking = mongoose.model("Tracking", trackingSchema);

module.exports = Tracking;
