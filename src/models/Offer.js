const mongoose = require("mongoose");

const offerSchema = mongoose.Schema(
  {
    affiliate: { type: String, required: true },
    offer_name: { type: String, required: true },
    offer_id: { type: String, required: true, unique: true },
    payout: { type: String },
    sub_url: { type: String },
    unsub_url: { type: String },
    open_url: { type: String },
    opt_out_url: { type: String },
    sensitive: { type: String },
    from_name: { type: String },
    subject: { type: String },
    restrictions: { type: String },
  },
  {
    timestamps: true,
  },
);

const Offer = mongoose.model("Offer", offerSchema);

module.exports = Offer;
