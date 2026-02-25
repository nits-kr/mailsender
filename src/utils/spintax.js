const crypto = require("crypto");

/**
 * Spintax and Random Data Utility
 * Ported from legacy PHP implementation
 */

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

const utils = {
  num: (x) => getRandomString(x, "num"),
  smallchar: (x) => getRandomString(x, "smallchar"),
  bigchar: (x) => getRandomString(x, "bigchar"),
  bigsmallchar: (x) => getRandomString(x, "bigsmallchar"),
  mixsmallalphanum: (x) => getRandomString(x, "mixsmallalphanum"),
  mixbigalphanum: (x) => getRandomString(x, "mixbigalphanum"),
  mixall: (x) => getRandomString(x, "mixall"),
  hexdigit: (x) => getRandomString(x, "hexdigit"),
  RFC_Date_EST: () => new Date().toUTCString().replace("GMT", "EST"), // Simplified
  RFC_Date_UTC: () => new Date().toUTCString(),
  RFC_Date_EDT: () => new Date().toUTCString().replace("GMT", "EDT"),
  RFC_Date_IST: () =>
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
};

/**
 * Processes tags like [[bigchar(10)]] or [[mixall(5)]]
 */
const processSpintax = (text) => {
  if (!text) return "";

  return text.replace(/\[\[(.*?)\((.*?)\)\]\]/g, (match, func, arg) => {
    if (utils[func]) {
      return utils[func](parseInt(arg) || 0);
    }
    return match;
  });
};

/**
 * Port of PHP ascii2hex (Quoted-Printable style)
 */
const quotedPrintableEncode = (str) => {
  return str
    .split("")
    .map((char) => {
      const hex = char.charCodeAt(0).toString(16).toUpperCase();
      return "=" + (hex.length === 1 ? "0" + hex : hex);
    })
    .join("");
};

module.exports = {
  processSpintax,
  quotedPrintableEncode,
  ...utils,
};
