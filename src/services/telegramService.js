/**
 * telegramService.js
 * Sends campaign notifications to a Telegram group.
 * Credentials are read from .env (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID).
 */

const axios = require("axios");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

/**
 * Send a plain text or HTML message to the configured Telegram group.
 * @param {string} message - HTML-formatted message
 */
const sendTelegramMessage = async (message) => {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn("[Telegram] BOT_TOKEN or CHAT_ID not set in .env — skipping.");
    return;
  }
  try {
    await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      },
      { timeout: 10000 },
    );
  } catch (err) {
    console.error("[Telegram] Failed to send message:", err.message);
  }
};

/**
 * Build and send a campaign notification.
 * @param {object} campaign - FsockAutoCampaign document
 * @param {string} statusMessage - Human-readable status text
 */
const sendCampaignNotification = async (campaign, statusMessage) => {
  const message =
    `<b>📢 Auto Campaign Notification</b>\n` +
    `<b>━━━━━━━━━━━━━━━━━━━━━━━━━</b>\n` +
    `<b>📌 Campaign:</b> ${campaign.name || "Unnamed"}\n` +
    `<b>🆔 ID:</b> ${campaign._id}\n` +
    `<b>⏰ Time:</b> ${new Date().toLocaleString()}\n` +
    `<b>📧 From:</b> ${campaign.from_email}\n` +
    `<b>📊 Status:</b> ${statusMessage}\n` +
    `<b>━━━━━━━━━━━━━━━━━━━━━━━━━</b>\n` +
    `✅ <i>Notification sent by AutoMailer MERN.</i>`;

  await sendTelegramMessage(message);
};

module.exports = { sendTelegramMessage, sendCampaignNotification };
