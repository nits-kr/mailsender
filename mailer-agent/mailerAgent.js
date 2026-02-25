const nodemailer = require("nodemailer");
const axios = require("axios");

/**
 * Mailer Agent - Pure Node.js Replacement for maild_man_lu_new.php
 */

const API_BASE =
  process.env.API_BASE || "http://173.249.50.153:5000/api/legacy";

const charsets = {
  num: "0123456789",
  smallchar: "abcdefghijklmnopqrstuvwxyz",
  bigchar: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  bigsmallchar: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  mixsmallalphanum: "0123456789abcdefghijklmnopqrstuvwxyz",
  mixbigalphanum: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  mixall: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  hexdigit: "0123456789abcdef",
};

const getRandomString = (len, charset) => {
  let res = "";
  const chars = charsets[charset] || charsets.mixall;
  for (let i = 0; i < len; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
};

const spintaxUtils = {
  num: (x) => getRandomString(x, "num"),
  smallchar: (x) => getRandomString(x, "smallchar"),
  bigchar: (x) => getRandomString(x, "bigchar"),
  bigsmallchar: (x) => getRandomString(x, "bigsmallchar"),
  mixsmallalphanum: (x) => getRandomString(x, "mixsmallalphanum"),
  mixbigalphanum: (x) => getRandomString(x, "mixbigalphanum"),
  mixall: (x) => getRandomString(x, "mixall"),
  hexdigit: (x) => getRandomString(x, "hexdigit"),
};

const processSpintax = (text) => {
  if (!text) return "";
  return text.replace(/\[\[(.*?)\((.*?)\)\]\]/g, (match, func, arg) => {
    if (spintaxUtils[func]) {
      return spintaxUtils[func](parseInt(arg) || 0);
    }
    return match;
  });
};

const run = async () => {
  const [, , campaignId, encodedEmails, smtpIp] = process.argv;

  if (!campaignId || !encodedEmails || !smtpIp) {
    console.error(
      "Usage: node mailerAgent.js <campaignId> <base64Emails> <smtpIp>",
    );
    process.exit(1);
  }

  try {
    // 1. Fetch Campaign Details
    const campaignRes = await axios.get(`${API_BASE}/campaign/${campaignId}`);
    const campaign = campaignRes.data;

    // 2. Fetch SMTP Details
    const smtpRes = await axios.get(`${API_BASE}/ip/${smtpIp}`);
    const smtp = smtpRes.data;

    const emails = Buffer.from(encodedEmails, "base64")
      .toString("utf-8")
      .split("\n")
      .filter((e) => e.trim());

    // Create Transporter
    const transporter = nodemailer.createTransport({
      host: smtp.hostname,
      port: smtp.port || 25,
      secure: smtp.tls === "Yes",
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    let successCount = 0;
    let errorCount = 0;
    let lastError = null;

    for (const email of emails) {
      const dateStr = new Date().toLocaleDateString();
      const name = email.split("@")[0].replace(/[.\-_0-9]/g, "");
      const msgId = `<${getRandomString(20, "mixall")}@${campaign.domain}>`;

      // Replacements
      let body = campaign.message_html;
      body = body.replace(/{{email}}/g, email);
      body = body.replace(/{{name}}/g, name);
      body = body.replace(/{{domain}}/g, campaign.domain);
      body = body.replace(/{{date}}/g, dateStr);
      body = body.replace(/{{msgid}}/g, msgId);

      body = processSpintax(body);

      const mailOptions = {
        from: `"${processSpintax(campaign.from_email)}" <${campaign.ip}>`,
        to: email,
        subject: processSpintax(campaign.name),
        html: body,
        headers: {
          "Message-ID": msgId,
          "X-Mailer": campaign.xmailer || "NodeJS Mailer",
        },
      };

      try {
        await transporter.sendMail(mailOptions);
        successCount++;
      } catch (err) {
        errorCount++;
        lastError = err.message;
        console.error(`Error sending to ${email}:`, err.message);
      }
    }

    // 3. Log Results back to Central API
    await axios.post(`${API_BASE}/log`, {
      campaign_id: campaignId,
      log_text: `Sent successfully to ${successCount} out of ${emails.length}. Errors: ${errorCount}. Last Error: ${lastError || "None"}`,
      type: "sending_result",
    });

    console.log(`Finished: ${successCount} sent, ${errorCount} failed.`);
  } catch (error) {
    console.error("Agent Critical Error:", error.message);
    process.exit(1);
  }
};

run();
