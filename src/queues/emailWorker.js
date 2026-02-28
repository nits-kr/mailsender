const nodemailer = require("nodemailer");
const IP = require("../models/IP");
const SmtpDetail = require("../models/SmtpDetail");
const Campaign = require("../models/Campaign");
const CampaignLog = require("../models/CampaignLog");
const { evaluate: guardianEvaluate } = require("../services/guardianService");
const imagePolymorphismService = require("../services/intelligence/ImagePolymorphismService");
const path = require("path");
const fs = require("fs-extra");

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
    wait_time,
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

    let smtpConfig = null;

    const ipKey = String(mailing_ip.split("|")[0] || "").trim();
    const ipRecord =
      (await IP.findOne({ ip: ipKey })) ||
      (await IP.findOne({ ip: new RegExp(`^${ipKey}$`, "i") }));
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
    } else {
      // Fallback for new SMTP Details UI records (assignedip/server based).
      const smtpDetail =
        (await SmtpDetail.findOne({ assignedip: ipKey })) ||
        (await SmtpDetail.findOne({ server: ipKey })) ||
        (await SmtpDetail.findOne({
          assignedip: new RegExp(`^${ipKey}$`, "i"),
        })) ||
        (await SmtpDetail.findOne({ server: new RegExp(`^${ipKey}$`, "i") }));
      if (smtpDetail && smtpDetail.hostname) {
        const normalizedTls = String(smtpDetail.tls || "").toLowerCase();
        const isSecure =
          normalizedTls === "1" ||
          normalizedTls === "yes" ||
          normalizedTls === "true";

        smtpConfig = {
          host: smtpDetail.hostname,
          port: Number(smtpDetail.port) || (isSecure ? 465 : 587),
          secure: isSecure,
          auth: smtpDetail.user
            ? { user: smtpDetail.user, pass: smtpDetail.pass }
            : null,
          tls: { rejectUnauthorized: false },
          debug: true,
          logger: true,
        };
      }
    }

    // Fail fast with actionable error if no SMTP mapping was found in DB.
    if (!smtpConfig) {
      throw new Error(
        `SMTP mapping not found for '${ipKey}'. Configure hostname/user/pass/port in IP or SMTP Details.`,
      );
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
      if (type === "ascii") {
        // Match legacy PHP ascii2hex behavior (Quoted-Printable style)
        const hex = Array.from(text)
          .map(
            (char) =>
              "=" +
              char.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0"),
          )
          .join("");
        return `=?UTF-8?Q?${hex}?=`;
      }
      return text;
    };

    const transformTags = (text) => {
      if (!text) return "";

      const offer = job.data.offer_id || "0";

      // Legacy tracking tags
      const em = `${offer}||${email}`;
      const ed = Buffer.from(em).toString("base64");
      const eg = ed.split("").reverse().join("");
      const eh = Buffer.from(eg).toString("base64");

      const newem = `${offer}|${email}`;
      const newembase = Buffer.from(newem).toString("base64");
      const newemhex = Buffer.from(newem).toString("hex");
      const trackMd5 = require("crypto")
        .createHash("md5")
        .update(email)
        .digest("hex");

      return text
        .replace(/{unsl}/g, eh)
        .replace(/{ourl}/g, eh)
        .replace(/{oln}/g, eh)
        .replace(/{base_trk}/g, newembase)
        .replace(/{hex_trk}/g, newemhex)
        .replace(/\(\(_track_\)\)/g, trackMd5);
    };

    const mailOptions = {
      from: `"${encodeHeader(from_name, from_enc)}" <${from_email}>`,
      to: email,
      subject: encodeHeader(subject, subject_enc),
      messageId: msgId ? msgId.replace(/[<>]/g, "") : undefined, // NodeMailer auto-adds < >, so strip them if present
      headers: {
        "X-Mailer": xmailer === "1" ? "V-Mailer" : undefined,
        "Reply-To": reply_to === "1" ? from_email : undefined,
      },
    };

    if (campaign_id) {
      mailOptions.headers["X-Campaign-Fingerprint"] = require("crypto")
        .createHash("md5")
        .update(`${campaign_id}:${email}`)
        .digest("hex");
    }

    // Add custom headers
    if (headers) {
      const customHeaderLines = headers.split("\n");
      customHeaderLines.forEach((line) => {
        const [key, ...valueParts] = line.split(":");
        if (key && valueParts.length) {
          mailOptions.headers[key.trim()] = transformTags(
            valueParts.join(":").trim(),
          );
        }
      });
    }

    if (msg_type === "html" || msg_type === "mime") {
      let mutatedHtml = transformTags(body_html);

      // AI Image Polymorphism: Find local uploads and mutate them
      // We look for src attributes pointing to our uploads directory
      const imgRegex = /src="([^"]*\/uploads\/[^"]*)"/g;
      let match;
      const processedHtml = mutatedHtml;

      while ((match = imgRegex.exec(mutatedHtml)) !== null) {
        const originalUrl = match[1];
        const filename = path.basename(originalUrl);
        const sourcePath = path.join(
          __dirname,
          "../../uploads/images",
          filename,
        );

        if (await fs.pathExists(sourcePath)) {
          const uniqueId = require("crypto").randomBytes(4).toString("hex");
          const targetFilename = `poly_${uniqueId}_${filename}`;
          const targetPath = path.join(
            __dirname,
            "../../uploads/temp",
            targetFilename,
          );

          await fs.ensureDir(path.dirname(targetPath));
          const success = await imagePolymorphismService.mutateImage(
            sourcePath,
            targetPath,
          );

          if (success) {
            // Replace local URL with the mutated one
            // Assuming the frontend can serve from /uploads/temp or we handle the path
            const mutatedUrl = originalUrl.replace(
              filename,
              `temp/${targetFilename}`,
            );
            mutatedHtml = mutatedHtml.replace(originalUrl, mutatedUrl);
          }
        }
      }

      mailOptions.html = mutatedHtml;
    }

    if (msg_type === "plain" || msg_type === "mime") {
      mailOptions.text = transformTags(body_plain);
    }

    const info = await transporter.sendMail(mailOptions);

    // Update Campaign Stats & Log SMTP Transcript
    if (campaign_id) {
      const updatedCampaign = await Campaign.findByIdAndUpdate(
        campaign_id,
        { $inc: { success_count: 1 } },
        { new: true },
      );

      const totalSent =
        (updatedCampaign.success_count || 0) +
        (updatedCampaign.error_count || 0);
      const transcriptText = smtpTranscript.join("\n");
      await CampaignLog.create({
        campaign_id,
        log_text: `[${email}] SENT SUCCESS\n${transcriptText}\nResponse: ${info.response}`,
        type: "success",
        sent: totalSent,
        mail_status: `${email} success`,
        inbox_percent: 0,
      });

      // Guardian Evaluation
      await guardianEvaluate(campaign_id).catch(() => {});

      // Auto-complete if finished
      if (totalSent >= (updatedCampaign.total_emails || 0)) {
        await Campaign.findByIdAndUpdate(campaign_id, {
          status: "Completed",
          end_time: new Date(),
        });
      }
    }

    console.log(`Email sent successfully to ${email} via ${mailing_ip}`);

    // ── wait_time: per-email delay to control sending speed ──────────────
    const delaySeconds = Number(wait_time);
    if (delaySeconds > 0) {
      await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
    }
  } catch (error) {
    console.error(`Error sending email to ${email}`, error);
    if (campaign_id) {
      const updatedCampaign = await Campaign.findByIdAndUpdate(
        campaign_id,
        { $inc: { error_count: 1 } },
        { new: true },
      );
      const totalSent =
        (updatedCampaign.success_count || 0) +
        (updatedCampaign.error_count || 0);
      await CampaignLog.create({
        campaign_id,
        log_text: `[${email}] SEND ERROR: ${error.message}`,
        type: "error",
        sent: totalSent,
        mail_status: `${email} error`,
        inbox_percent: 0,
      });

      // Guardian Evaluation
      await guardianEvaluate(campaign_id).catch(() => {});

      // Auto-complete if finished
      if (totalSent >= (updatedCampaign.total_emails || 0)) {
        await Campaign.findByIdAndUpdate(campaign_id, {
          status: "Completed",
          end_time: new Date(),
        });
      }
    }
    throw error;
  }
};

module.exports = emailWorker;
