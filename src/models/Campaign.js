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
    bounce_count: { type: Number, default: 0 },
    complaint_count: { type: Number, default: 0 },
    inbox_count: { type: Number, default: 0 },
    spam_count: { type: Number, default: 0 },
    promo_count: { type: Number, default: 0 },
    open_count: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "Running", "Completed", "Stopped"],
      default: "Pending",
    },
    guardian_settings: {
      spam_threshold: { type: Number, default: 10 }, // %
      bounce_threshold: { type: Number, default: 5 }, // %
      drop_threshold: { type: Number, default: 40 }, // % drop in inbox placement
      complaint_threshold: { type: Number, default: 0.3 }, // %
    },
    guardian_logs: [
      {
        event: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    start_time: { type: Date, default: Date.now },
    end_time: { type: Date },
    mode: { type: String, enum: ["test", "bulk", "space"], default: "test" },
    sen_t: { type: String, enum: ["manual", "auto"], default: "manual" },
    type: {
      type: String,
      enum: [
        "test_manual",
        "test_auto",
        "bulk_manual",
        "bulk_auto",
        "space_sending",
      ],
      default: "test_manual",
    },
    domain: { type: String },
    from_email: { type: String },
    mail_after: { type: Number, default: 100 },
    sleep_time: { type: Number, default: 5 },
    limit_to_send: { type: Number, default: 500 },
    current_ip_index: { type: Number, default: 0 },
    ip_list: [{ type: String }],
    total_queued: { type: Number, default: 0 },

    // Configuration snapshot fields for reloading
    accs: { type: String },
    headers: { type: String },
    subject: { type: String },
    from_name: { type: String },
    emails: { type: String },
    msg_type: { type: String, default: "html" },
    message_html: { type: String },
    message_plain: { type: String },
    search_replace: { type: String },
    total_send: { type: String },
    wait_time: { type: String, default: "2" },
    message_id: { type: String },
    inbox_percent: { type: Number, default: 100 },
    reply_to: { type: String, default: "0" },
    xmailer: { type: String, default: "0" },
    interval_time: { type: String },
    charset: { type: String, default: "UTF-8" },
    encoding: { type: String, default: "8bit" },
    charset_alt: { type: String, default: "UTF-8" },
    encoding_alt: { type: String, default: "8bit" },
  },
  { timestamps: true },
);

// Index to allow fast retrieval of active/recently completed campaigns
campaignSchema.index({ status: 1, updatedAt: -1 });

module.exports = mongoose.model("Campaign", campaignSchema);
