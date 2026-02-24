const nodemailer = require("nodemailer");

const testSmtp = async (req, res) => {
  const { server, port, usr, pass, tls, ip, from, emails, sub, message } =
    req.body;

  const recipients = emails
    .split("\n")
    .map((email) => email.trim())
    .filter((email) => email);

  // Configure transporter
  const transporter = nodemailer.createTransport({
    host: server,
    port: parseInt(port),
    secure: tls === "Yes" && parseInt(port) === 465, // Use SSL for 465, STARTTLS for others
    auth: {
      user: usr,
      pass: pass,
    },
    tls: {
      // PHP version had some loose TLS settings, we'll allow unauthorized for parity
      rejectUnauthorized: false,
    },
    debug: true,
    logger: true, // This will log to console, but we might want to capture it
  });

  // Capture logs
  let logs = "";
  transporter.on("log", (data) => {
    logs += data.message + "\n";
  });

  try {
    const info = await transporter.sendMail({
      from: `"${from}" <${ip}>`,
      to: recipients.join(","),
      subject: sub,
      html: message,
      replyTo: ip,
    });

    res.json({
      success: true,
      message: "Message has been sent",
      messageId: info.messageId,
      logs: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Message could not be sent. Mailer Error: ${error.message}`,
      logs: logs,
    });
  }
};

module.exports = { testSmtp };
