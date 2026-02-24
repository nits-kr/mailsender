const mongoose = require("mongoose");

const offerSuppQueueSchema = mongoose.Schema(
  {
    offer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      required: true,
    },
    filename: { type: String, required: true },
    new_filename: { type: String },
    vendor_supp_filename: { type: String },
    command: { type: String },
    status: { type: Number, default: 0 },
    log: { type: String },
    initial_file_count: { type: Number, default: 0 },
    final_file_count: { type: Number, default: 0 },
    suppressed_file_count: { type: Number, default: 0 },
    date_queued: { type: Date, default: Date.now },
    date_completed: { type: Date },
  },
  {
    timestamps: true,
  },
);

const OfferSuppQueue = mongoose.model("OfferSuppQueue", offerSuppQueueSchema);

module.exports = OfferSuppQueue;
