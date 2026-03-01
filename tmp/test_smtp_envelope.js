const nodemailer = require("nodemailer");

async function testEnvelope() {
  const smtpConfig = {
    host: "localhost",
    port: 587,
    auth: { user: "auth_user@example.com", pass: "password" },
  };

  const from_name = "Sender Name";
  const from_email = "display_from@example.com";
  const email = "recipient@example.com";

  const mailOptions = {
    from: `"${from_name}" <${from_email}>`,
    to: email,
    subject: "Test Subject",
  };

  // Mocking the injection logic from emailWorker.js
  if (smtpConfig && smtpConfig.auth && smtpConfig.auth.user) {
    mailOptions.envelope = {
      from: smtpConfig.auth.user,
      to: email,
    };
  }

  console.log("Mail Options:", JSON.stringify(mailOptions, null, 2));

  if (
    mailOptions.envelope &&
    mailOptions.envelope.from === smtpConfig.auth.user
  ) {
    console.log("SUCCESS: Envelope FROM correctly set to SMTP auth user.");
  } else {
    console.error("FAILURE: Envelope FROM not set correctly.");
  }
}

testEnvelope();
