const mongoose = require("mongoose");

const offerSuppMappingSchema = mongoose.Schema(
  {
    offer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      required: true,
      unique: true,
    },
    filename: { type: String, required: true },
    upload_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

const OfferSuppMapping = mongoose.model(
  "OfferSuppMapping",
  offerSuppMappingSchema,
);

module.exports = OfferSuppMapping;
