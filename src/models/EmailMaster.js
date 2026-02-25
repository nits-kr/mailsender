const mongoose = require("mongoose");

const emailMasterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    md5: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    domain: {
      type: String,
    },
    status: {
      type: String,
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

// Index for fast MD5 lookups
emailMasterSchema.index({ md5: 1 });

const EmailMaster = mongoose.model("EmailMaster", emailMasterSchema);

module.exports = EmailMaster;
