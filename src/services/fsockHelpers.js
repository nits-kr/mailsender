/**
 * fsockHelpers.js
 * Pure-JS port of PHP fsock_functions.php + additional utilities.
 * All [[funcName(arg)]] placeholder replacement for headers/msgid/returnPath.
 */

const randomChars = (chars, len) => {
  let out = "";
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};

const num = (x) => randomChars("0123456789", Number(x) || 0);
const smallchar = (x) =>
  randomChars("abcdefghijklmnopqrstuvwxyz", Number(x) || 0);
const bigchar = (x) =>
  randomChars("ABCDEFGHIJKLMNOPQRSTUVWXYZ", Number(x) || 0);
const mixsmallbigchar = (x) =>
  randomChars(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    Number(x) || 0,
  );
const mixsmallalphanum = (x) =>
  randomChars("0123456789abcdefghijklmnopqrstuvwxyz", Number(x) || 0);
const mixbigalphanum = (x) =>
  randomChars("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", Number(x) || 0);
const mixall = (x) =>
  randomChars(
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    Number(x) || 0,
  );
const hexdigit = (x) => randomChars("0123456789abcdef", Number(x) || 0);

const RFC_Date_EST = () => {
  const d = new Date();
  return d.toUTCString().replace("GMT", "-0500 (EST)");
};
const RFC_Date_UTC = () => {
  const d = new Date();
  return d.toUTCString().replace("GMT", "+0000 (UTC)");
};
const RFC_Date_EDT = () => {
  const d = new Date();
  return d.toUTCString().replace("GMT", "-0400 (EDT)");
};
const RFC_Date_IST = () => {
  const d = new Date();
  return d.toUTCString().replace("GMT", "+0530 (IST)");
};

const ascii2hex = (str) =>
  Array.from(str)
    .map(
      (c) => "=" + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0"),
    )
    .join("");

const functionMap = {
  num,
  smallchar,
  bigchar,
  mixsmallbigchar,
  mixsmallalphanum,
  mixbigalphanum,
  mixall,
  hexdigit,
  rfc_date_est: RFC_Date_EST,
  rfc_date_utc: RFC_Date_UTC,
  rfc_date_edt: RFC_Date_EDT,
  rfc_date_ist: RFC_Date_IST,
};

/**
 * Replaces all [[funcName(arg)]] patterns in a template string.
 * @param {string} template
 * @returns {string}
 */
const applyPlaceholders = (template) => {
  if (!template) return template;
  return template.replace(/\[\[(.*?)\]\]/gi, (_, expr) => {
    const parenIdx = expr.indexOf("(");
    const funcName =
      parenIdx !== -1 ? expr.slice(0, parenIdx).trim() : expr.trim();
    const argStr =
      parenIdx !== -1
        ? expr
            .slice(parenIdx + 1)
            .replace(/\)$/, "")
            .trim()
        : "";
    const fn = functionMap[funcName.toLowerCase()];
    return fn ? fn(argStr) : `[[${expr}]]`;
  });
};

/**
 * Encode subject/from-name per sencode/fmencode setting.
 */
const encodeHeader = (text, type) => {
  if (!type || type === "reset") return text;
  if (type === "base64")
    return `=?UTF-8?B?${Buffer.from(text).toString("base64")}?=`;
  if (type === "ascii") return `=?UTF-8?Q?${ascii2hex(text)}?=`;
  return text;
};

/**
 * UUencode a string (port of PHP str_to_uue).
 */
const str_to_uue = (str) => {
  const buf = Buffer.from(str, "binary");
  const encoded = buf.toString("base64"); // approximate UUe
  return `begin 0644 unknown\n${encoded}\nend`;
};

module.exports = {
  num,
  smallchar,
  bigchar,
  mixsmallbigchar,
  mixsmallalphanum,
  mixbigalphanum,
  mixall,
  hexdigit,
  RFC_Date_EST,
  RFC_Date_UTC,
  RFC_Date_EDT,
  RFC_Date_IST,
  ascii2hex,
  applyPlaceholders,
  encodeHeader,
  str_to_uue,
};
