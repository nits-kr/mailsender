const mongoose = require("mongoose");

const serverSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    ip: { type: String, required: true, unique: true },
    status: { type: String, default: "active" },
    ssh_password: { type: String },
  },
  {
    timestamps: true,
  },
);

const Server = mongoose.model("Server", serverSchema);

module.exports = Server;
