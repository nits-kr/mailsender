const crypto = require("crypto");

/**
 * Port of legacy PHP Message-ID generation patterns.
 * Originally from http_get_messsage_id.php
 */

const helpers = {
  randdnum: (len) => {
    const chars = "0123456789";
    let res = "";
    for (let i = 0; i < len; i++)
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    return res;
  },
  randdsmallchar: (len) => {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    let res = "";
    for (let i = 0; i < len; i++)
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    return res;
  },
  randdbigchar: (len) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let res = "";
    for (let i = 0; i < len; i++)
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    return res;
  },
  randmixchar: (len) => {
    const chars =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let res = "";
    for (let i = 0; i < len; i++)
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    return res;
  },
  randmixbignum: (len) => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let res = "";
    for (let i = 0; i < len; i++)
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    return res;
  },
  randmixsmallnum: (len) => {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
    let res = "";
    for (let i = 0; i < len; i++)
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    return res;
  },
};

const generateMessageId = (patternNum, domain) => {
  const h = helpers;
  let returnId = "";
  const num = parseInt(patternNum);

  switch (num) {
    case 1:
      returnId = `<${h.randdsmallchar(4)}_${h.randdnum(8)}_${h.randdnum(6)}_${h.randdnum(6)}_${h.randdnum(1)}_${h.randdnum(4)}.${h.randdnum(10)}@${domain}>`;
      break;
    case 2: {
      const msiden =
        Date.now().toString() + Math.floor(Math.random() * 100000).toString();
      const msidencoded = crypto
        .createHash("md5")
        .update(Buffer.from(msiden).toString("base64"))
        .digest("hex");
      returnId = `<${msidencoded}@${domain}>`;
      break;
    }
    case 3:
      returnId = `<${h.randmixchar(42)}@${domain}>`;
      break;
    case 4:
      returnId = `<${h.randdnum(10)}.${h.randdnum(6)}.${h.randdnum(13)}@${domain}>`;
      break;
    case 5:
      returnId = `<${h.randdnum(1)}${h.randmixchar(11)}_${h.randmixchar(9)}@${domain}>`;
      break;
    case 6:
      returnId = `<${h.randmixbignum(2)}.${h.randmixbignum(2)}.${h.randdnum(5)}.${h.randmixbignum(8)}@${domain}>`;
      break;
    case 7:
      returnId = `<${h.randdnum(10)}${h.randmixsmallnum(6)}-${h.randmixsmallnum(8)}-${h.randmixsmallnum(4)}-${h.randmixsmallnum(4)}-${h.randmixsmallnum(4)}-${h.randmixsmallnum(12)}-${h.randdnum(6)}@${domain}>`;
      break;
    case 8: {
      const strtotime = new Date()
        .toISOString()
        .replace(/[-:T]/g, "")
        .slice(0, 14);
      returnId = `<${strtotime}.${h.randdnum(1)}.${h.randdbigchar(16)}@${domain}>`;
      break;
    }
    case 9:
      returnId = `<${h.randdnum(10)}${h.randmixsmallnum(6)}-${h.randmixsmallnum(8)}-${h.randmixsmallnum(4)}-${h.randmixsmallnum(4)}-${h.randmixsmallnum(4)}-${h.randmixsmallnum(12)}-${h.randdnum(6)}@email.amazonses.com>`;
      break;
    case 10:
      returnId = `<${h.randdnum(15)}.${h.randdnum(8)}.${h.randmixchar(13)}@${domain}>`;
      break;
    case 11:
      returnId = `<${h.randdnum(10)}.${h.randdnum(4)}.${h.randdnum(10)}.${h.randdsmallchar(4)}@${domain}>`;
      break;
    case 12:
      returnId = `<${h.randmixchar(11)}.${h.randdbigchar(4)}${h.randdnum(9)}.${h.randdnum(10)}@${domain}>`;
      break;
    case 13:
      returnId = `<${h.randdnum(1)}.${h.randdnum(1)}.${h.randmixchar(3)}.${h.randmixchar(3)}.${h.randmixchar(15)}.${h.randdnum(1)}@${domain}>`;
      break;
    case 14:
      returnId = `<${h.randmixchar(8)}-${h.randmixchar(4)}-${h.randmixchar(4)}-${h.randmixchar(4)}-${h.randmixchar(12)}@${domain}>`;
      break;
    case 15:
      returnId = `<${h.randdbigchar(7)}=${h.randmixchar(30)}_${h.randmixchar(11)}@${domain}>`;
      break;
    case 16:
      returnId = `<${h.randmixchar(8)}_${h.randmixchar(12)}_${h.randmixchar(10)}@${domain}>`;
      break;
    case 17:
      returnId = `<${h.randdsmallchar(36)}@${domain}>`;
      break;
    case 18:
      returnId = `<${h.randdsmallchar(6)}${h.randdnum(17)}@${domain}>`;
      break;
    case 19:
      returnId = `<${h.randdnum(9)}.${h.randdnum(8)}.${h.randdnum(10)}${h.randdnum(3)}.JavaMail.cloud@${domain}>`;
      break;
    case 20:
      returnId = `<${h.randmixchar(22)}@${domain}>`;
      break;
    case 21:
      returnId = `<${h.randdnum(11)}${h.randmixsmallnum(5)}-${h.randmixsmallnum(8)}-${h.randmixsmallnum(4)}-${h.randmixsmallnum(4)}-${h.randmixsmallnum(4)}-${h.randmixsmallnum(12)}-${h.randdnum(6)}@email.amazonses.com>`;
      break;
    case 22:
      returnId = `<${h.randmixsmallnum(8)}-${h.randmixsmallnum(4)}-${h.randmixsmallnum(4)}-${h.randmixsmallnum(4)}-${h.randmixsmallnum(4)}${h.randdnum(8)}@${domain}>`;
      break;
    case 23:
      returnId = `<${h.randmixchar(22)}@${domain}>`;
      break;
    case 24:
      returnId = `<${h.randmixsmallnum(32)}@${domain}>`;
      break;
    default:
      // Fallback to pattern 1 if invalid
      returnId = `<${h.randdsmallchar(4)}_${h.randdnum(8)}_${h.randdnum(6)}_${h.randdnum(6)}_${h.randdnum(1)}_${h.randdnum(4)}.${h.randdnum(10)}@${domain}>`;
  }

  return returnId;
};

module.exports = {
  generateMessageId,
};
