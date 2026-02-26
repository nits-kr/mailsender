const mongoose = require("mongoose");

const smtpDetailSchema = new mongoose.Schema(
  {
    assignedip: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    server: {
      type: String,
      required: true,
      trim: true,
    },
    hostname: {
      type: String,
      default: "",
      trim: true,
    },
    user: {
      type: String,
      default: "",
      trim: true,
    },
    pass: {
      type: String,
      default: "",
    },
    port: {
      type: String,
      default: "587",
    },
    tls: {
      type: String,
      default: "0",
    },
    accountname: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const SmtpDetail = mongoose.model("SmtpDetail", smtpDetailSchema);

module.exports = SmtpDetail;
