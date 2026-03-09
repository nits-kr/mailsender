const IP = require("../models/IP");
const SmtpDetail = require("../models/SmtpDetail");

/**
 * Resolves an IP, Server Alias, or assigned IP string to its corresponding SMTP connection details.
 * Checks the IP collection first, then falls back to SmtpDetail collection.
 *
 * @param {string} ipKey The string from the frontend (e.g. "192.168.1.1" or "AliSing07")
 * @returns {object|null} Returns { host, port, user, pass, tls } or null if not found.
 */
async function resolveSmtpDetails(ipKey) {
  ipKey = String(ipKey || "").trim();
  if (!ipKey) return null;

  console.log(`[smtpResolver] Resolving: "${ipKey}"`);

  // 1. Try legacy IP collection
  const ipRecord =
    (await IP.findOne({ ip: ipKey })) ||
    (await IP.findOne({ ip: new RegExp(`^${ipKey}$`, "i") }));

  if (ipRecord && ipRecord.hostname) {
    console.log(`[smtpResolver] Found in IP collection: ${ipRecord.ip}`);
    return {
      host: ipRecord.hostname,
      port: ipRecord.port || 25,
      user: ipRecord.user || "",
      pass: ipRecord.pass || "",
      tls: ipRecord.tls === "Yes",
    };
  }

  // 2. Try SmtpDetail collection (Server Alias or assignedip)
  const smtpDetail =
    (await SmtpDetail.findOne({ assignedip: ipKey })) ||
    (await SmtpDetail.findOne({ server: ipKey })) ||
    (await SmtpDetail.findOne({
      assignedip: new RegExp(`^${ipKey}$`, "i"),
    })) ||
    (await SmtpDetail.findOne({ server: new RegExp(`^${ipKey}$`, "i") }));

  if (smtpDetail && smtpDetail.hostname) {
    console.log(
      `[smtpResolver] Found in SmtpDetail collection: ${smtpDetail.server} -> ${smtpDetail.assignedip}`,
    );
    return {
      host: smtpDetail.hostname,
      port: Number(smtpDetail.port) || (smtpDetail.tls === "1" ? 465 : 587),
      user: smtpDetail.user || "",
      pass: smtpDetail.pass || "",
      tls:
        String(smtpDetail.tls) === "1" ||
        String(smtpDetail.tls).toLowerCase() === "yes",
    };
  }

  console.log(`[smtpResolver] Not found: "${ipKey}"`);
  return null;
}

module.exports = { resolveSmtpDetails };
