const mongoose = require("mongoose");

const complainerSuppressionSchema = new mongoose.Schema({
  offer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer",
    required: true,
  },
  email_id: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  date_inserted: {
    type: Date,
    default: Date.now,
  },
});

// Unique index to prevent duplicate emails for the same offer
complainerSuppressionSchema.index(
  { offer_id: 1, email_id: 1 },
  { unique: true },
);

module.exports = mongoose.model(
  "ComplainerSuppression",
  complainerSuppressionSchema,
);
