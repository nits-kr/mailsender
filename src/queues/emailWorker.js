const nodemailer = require("nodemailer");
const IP = require("../models/IP");
const Campaign = require("../models/Campaign");
const CampaignLog = require("../models/CampaignLog");

const emailWorker = async (job) => {
  const {
    campaign_id,
    from_email,
    from_name,
    mailing_ip,
    headers,
    subject,
    body_html,
    body_plain,
    email,
    mode,
    subject_enc,
    from_enc,
    msg_type,
    charset,
    encoding,
    charset_alt,
    encoding_alt,
    msgId,
    reply_to,
    xmailer,
  } = job.data;

  try {
    // Check if campaign is stopped
    if (campaign_id) {
      const campaign = await Campaign.findById(campaign_id);
      if (campaign && campaign.status === "Stopped") {
        console.log(
          `Job skipped for campaign ${campaign_id} because it is stopped.`,
        );
        return;
      }
    }

    let smtpConfig = {
      host: mailing_ip.split("|")[0],
      port: 25,
      secure: false,
      tls: { rejectUnauthorized: false },
      debug: true,
      logger: true,
    };

    const ipRecord = await IP.findOne({ ip: mailing_ip.split("|")[0] });
    if (ipRecord && ipRecord.hostname) {
      smtpConfig = {
        host: ipRecord.hostname,
        port: ipRecord.port || 25,
        secure: ipRecord.tls === "Yes",
        auth: ipRecord.user
          ? { user: ipRecord.user, pass: ipRecord.pass }
          : null,
        tls: { rejectUnauthorized: false },
        debug: true,
        logger: true,
      };
    }

    const transporter = nodemailer.createTransport(smtpConfig);

    // Capture SMTP Debug Logs
    const smtpTranscript = [];
    transporter.on("log", (log) => {
      if (log.type === "protocol") {
        smtpTranscript.push(log.message);
      }
    });

    const encodeHeader = (text, type) => {
      if (type === "reset" || !type) return text;
      if (type === "base64")
        return `=?UTF-8?B?${Buffer.from(text).toString("base64")}?=`;
      if (type === "ascii") return `=?UTF-8?Q?${text.replace(/ /g, "_")}?=`; // Simple Q-encoding
      return text;
    };

    const mailOptions = {
      from: `"${encodeHeader(from_name, from_enc)}" <${from_email}>`,
      to: email,
      subject: encodeHeader(subject, subject_enc),
      messageId: msgId,
      headers: {
        "X-Mailer": xmailer === "1" ? "V-Mailer" : undefined,
        "Reply-To": reply_to === "1" ? from_email : undefined,
      },
    };

    // Add custom headers
    if (headers) {
      const customHeaderLines = headers.split("\n");
      customHeaderLines.forEach((line) => {
        const [key, ...valueParts] = line.split(":");
        if (key && valueParts.length) {
          mailOptions.headers[key.trim()] = valueParts.join(":").trim();
        }
      });
    }

    if (msg_type === "html") {
      mailOptions.html = body_html;
    } else if (msg_type === "plain") {
      mailOptions.text = body_plain;
    } else if (msg_type === "mime") {
      // Simple MIME handling for now
      mailOptions.html = body_html;
      mailOptions.text = body_plain;
    }

    const info = await transporter.sendMail(mailOptions);

    // Update Campaign Stats & Log SMTP Transcript
    if (campaign_id) {
      await Campaign.findByIdAndUpdate(campaign_id, {
        $inc: { success_count: 1 },
      });

      // Log the transcript
      const transcriptText = smtpTranscript.join("\n");
      await CampaignLog.create({
        campaign_id,
        log_text: `[${email}] SENT SUCCESS\n${transcriptText}\nResponse: ${info.response}`,
        type: "success",
      });
    }

    console.log(`Email sent successfully to ${email} via ${mailing_ip}`);
  } catch (error) {
    console.error(`Error sending email to ${email}`, error);
    if (campaign_id) {
      await Campaign.findByIdAndUpdate(campaign_id, {
        $inc: { error_count: 1 },
      });
      await CampaignLog.create({
        campaign_id,
        log_text: `[${email}] SEND ERROR: ${error.message}`,
        type: "error",
      });
    }
    throw error;
  }
};

module.exports = emailWorker;
