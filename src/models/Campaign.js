const mongoose = require("mongoose");

const campaignSchema = mongoose.Schema(
  {
    template_name: { type: String, required: true },
    offer_id: { type: String },
    server: { type: String },
    mailer: { type: String, default: "Admin" },
    data_file: { type: String },
    total_emails: { type: Number, default: 0 },
    success_count: { type: Number, default: 0 },
    error_count: { type: Number, default: 0 },
    inbox_count: { type: Number, default: 0 },
    spam_count: { type: Number, default: 0 },
    promo_count: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "Running", "Completed", "Stopped"],
      default: "Pending",
    },
    start_time: { type: Date, default: Date.now },
    end_time: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Campaign", campaignSchema);
