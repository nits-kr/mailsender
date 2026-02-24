const mongoose = require("mongoose");

const logSchema = mongoose.Schema(
  {
    sent_on: {
      type: Date,
      default: Date.now,
    },
    mailer: {
      type: String,
      required: true,
    },
    template_id: {
      type: String,
      required: true,
    },
    interface: {
      type: String,
      required: true,
    },
    server: {
      type: String,
      required: true,
    },
    offer_id: {
      type: String,
      required: true,
    },
    domain: {
      type: String,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    test_sent: {
      type: Number,
      default: 0,
    },
    bulk_test_sent: {
      type: Number,
      default: 0,
    },
    bulk_test: {
      type: Number,
      default: 0,
    },
    error: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Log = mongoose.model("Log", logSchema);

module.exports = Log;
