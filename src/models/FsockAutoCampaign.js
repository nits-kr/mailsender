const mongoose = require("mongoose");

const fsockAutoCampaignSchema = new mongoose.Schema(
  {
    // Campaign identity
    name: { type: String, default: "" },
    mailer: { type: String, default: "Admin" },

    // Sender info
    from_email: { type: String, required: true },
    from_name: { type: String, default: "" },
    subject: { type: String, required: true },
    subject_enc: { type: String, default: "reset" }, // reset|base64|ascii
    from_enc: { type: String, default: "reset" },

    // Content
    headers: { type: String, default: "" },
    message_html: { type: String, default: "" },
    message_plain: { type: String, default: "" },
    msgid: { type: String, default: "" },

    // Targeting
    domain: { type: String, default: "" },
    offer_id: { type: String, default: "" },
    data_file: { type: String, required: true },

    // SMTP IPs (newline-separated string stored, array for runtime)
    mailing_ip_raw: { type: String, default: "" },
    mailing_ip_array: [{ type: String }],

    // Test emails
    test_email_raw: { type: String, default: "" },
    test_email_array: [{ type: String }],

    // Auto-send settings
    total_limit: { type: Number, required: true },
    send_limit: { type: Number, required: true },
    sleep_time: { type: Number, default: 2 }, // seconds between batches
    wait_time: { type: Number, default: 1 }, // seconds between IPs
    interval_time: { type: Number, default: 0 }, // minutes for space sending
    inbox_percentage: { type: Number, default: 100 }, // required inbox %
    test_after: { type: Number, default: 100 }, // send X mails before re-test

    // Campaign state
    status: {
      type: String,
      enum: ["Pending", "Running", "Completed", "Stopped", "Failed"],
      default: "Pending",
    },
    stop_flag: { type: Boolean, default: false },
    total_sent: { type: Number, default: 0 },
    success_count: { type: Number, default: 0 },
    error_count: { type: Number, default: 0 },
    started_at: { type: Date },
    completed_at: { type: Date },

    // Re-trigger tracking (fixes PHP recursive bug)
    retrigger_count: { type: Number, default: 0 },
    max_retriggers: { type: Number, default: 3 },

    // Telegram notification flag
    telegram_enabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

fsockAutoCampaignSchema.index({ status: 1, updatedAt: -1 });

module.exports = mongoose.model("FsockAutoCampaign", fsockAutoCampaignSchema);
