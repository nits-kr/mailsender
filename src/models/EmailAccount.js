const mongoose = require("mongoose");

const emailAccountSchema = mongoose.Schema(
  {
    accountType: { type: String, required: true },
    inboxImapHost: { type: String, required: true },
    spamImapHost: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const EmailAccount = mongoose.model("EmailAccount", emailAccountSchema);

module.exports = EmailAccount;
