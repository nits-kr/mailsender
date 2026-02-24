const mongoose = require("mongoose");

const ipSchema = mongoose.Schema(
  {
    ip: { type: String, required: true, unique: true },
    server: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
      required: true,
    },
    status: { type: String, default: "active" },
    hostname: { type: String },
    user: { type: String },
    pass: { type: String },
    port: { type: Number, default: 25 },
    tls: { type: String, default: "No" }, // Yes or No to match PHP
  },
  {
    timestamps: true,
  },
);

const IP = mongoose.model("IP", ipSchema);

module.exports = IP;
