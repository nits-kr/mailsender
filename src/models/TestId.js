const mongoose = require("mongoose");

const testIdSchema = new mongoose.Schema(
  {
    domain: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    inboxhostname: {
      type: String,
      required: true,
    },
    spamhostname: {
      type: String,
      required: true,
    },
    port: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["A", "D"], // A for Active, D for Deactive
      default: "A",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt, replacing 'created' and 'last_update_time'
  },
);

const TestId = mongoose.model("TestId", testIdSchema);

module.exports = TestId;
