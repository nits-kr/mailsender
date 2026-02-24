const mongoose = require("mongoose");

const dataFileSchema = mongoose.Schema(
  {
    filename: { type: String, required: true, unique: true },
    display_name: { type: String },
    count: { type: Number, default: 0 },
    status: { type: String, default: "active" },
    type: {
      type: String,
      enum: ["data", "bounce", "complain"],
      default: "data",
    },
  },
  {
    timestamps: true,
  },
);

const DataFile = mongoose.model("DataFile", dataFileSchema);

module.exports = DataFile;
