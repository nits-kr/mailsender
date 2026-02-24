const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema(
  {
    offer_master_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      required: true,
    },
    domain: {
      type: String,
      required: true,
    },
    link_type: {
      type: String,
      enum: ["Sub", "Unsub", "Open", "Opt-out"],
      required: true,
    },
    own_offerid: {
      type: String,
      required: true,
      unique: true,
    },
    pattern: {
      type: String,
      required: true,
      unique: true,
    },
    main_link: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      default: 1, // 1 for active, 0 for inactive
    },
    generated_link: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender_name: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Compound unique index for safety if needed, though pattern/own_offerid are unique
linkSchema.index({ own_offerid: 1, pattern: 1 }, { unique: true });

const Link = mongoose.model("Link", linkSchema);

module.exports = Link;
