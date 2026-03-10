/**
 * dkimService.js
 * Provides Nodemailer-compatible DKIM configuration.
 * Replaces PHP's DKIM_Add.php bug-prone manual signing.
 */
const fs = require("fs");

const DEFAULT_DKIM_PATH = process.env.DKIM_PRIVATE_KEY_PATH || "";

/**
 * Returns a Nodemailer DKIM configuration object if the private key exists.
 * @param {string} domain
 * @param {string} selector (default: "default")
 * @returns {object|null}
 */
const getNodemailerDkimOptions = (domain, selector = "default") => {
  if (!DEFAULT_DKIM_PATH || !domain) return null;

  try {
    if (fs.existsSync(DEFAULT_DKIM_PATH)) {
      const privateKey = fs.readFileSync(DEFAULT_DKIM_PATH, "utf8");
      return {
        domainName: domain,
        keySelector: selector,
        privateKey,
      };
    }
  } catch (err) {
    console.warn(
      `[DKIM] Error reading private key at ${DEFAULT_DKIM_PATH}:`,
      err.message,
    );
  }
  return null;
};

module.exports = {
  getNodemailerDkimOptions,
};
