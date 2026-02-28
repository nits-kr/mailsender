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

const EmailMaster = mongoose.model("EmailMaster", emailMasterSchema);

module.exports = EmailMaster;
