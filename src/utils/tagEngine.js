const crypto = require("crypto");

/**
 * TagEngine - Handles PHP-style dynamic tags and randomization for email templates.
 */
const TagEngine = {
  /**
   * Main entry point to process a string and replace all [[func()]] and ((tags)).
   */
  process: (text, context = {}) => {
    if (!text) return "";
    let processedText = text;

    // 1. Process Functions: [[func(X)]]
    processedText = processedText.replace(/\[\[(.*?)\]\]/gi, (match, p1) => {
      const parts = p1.split("(");
      const funcName = parts[0].trim();
      const argStr = parts[1] ? parts[1].replace(")", "").trim() : "";
      const arg = parseInt(argStr) || argStr;

      if (typeof TagEngine.functions[funcName] === "function") {
        return TagEngine.functions[funcName](arg);
      }
      return match; // Return unchanged if function not found
    });

    // 2. Process Static Tags: ((tag)) or {{tag}}
    processedText = processedText.replace(/\(\((.*?)\)\)/gi, (match, p1) => {
      const tagName = p1.trim();
      if (tagName === "_track_") {
        const email = context.email || "";
        return crypto.createHash("md5").update(email).digest("hex");
      }
      return match;
    });

    // 3. Process Contextual Tags: {{tag}}
    processedText = processedText.replace(/{{(.*?)}}/gi, (match, p1) => {
      const tagName = p1.trim().toLowerCase();
      if (tagName === "msgid" && context.msgId) {
        return context.msgId;
      }
      if (tagName === "email" && context.email) {
        return context.email;
      }
      if (tagName === "domain" && context.domain) {
        return context.domain;
      }

      // Advanced Legacy Content Encodings (Parity with PHP original)
      if (
        tagName.startsWith("htmlcontent_") ||
        tagName.startsWith("plaincontent_")
      ) {
        const content = tagName.startsWith("htmlcontent_")
          ? context.html
          : context.plain;
        if (!content) return match;

        if (tagName.endsWith("base64")) {
          return Buffer.from(content).toString("base64");
        }
        if (tagName.endsWith("uue")) {
          // Uuencode (Base32 approximation, legacy support)
          return TagEngine.functions.strToUue(content);
        }
        if (tagName.endsWith("qp")) {
          // Quoted-Printable
          return TagEngine.functions.quotedPrintableEncode(content);
        }
      }
      return match;
    });

    return processedText;
  },

  functions: {
    num: (len) => {
      let res = "";
      for (let i = 0; i < len; i++) res += Math.floor(Math.random() * 10);
      return res;
    },
    smallchar: (len) => {
      const chars = "abcdefghijklmnopqrstuvwxyz";
      let res = "";
      for (let i = 0; i < len; i++)
        res += chars.charAt(Math.floor(Math.random() * chars.length));
      return res;
    },
    bigchar: (len) => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let res = "";
      for (let i = 0; i < len; i++)
        res += chars.charAt(Math.floor(Math.random() * chars.length));
      return res;
    },
    mixsmallbigchar: (len) => {
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let res = "";
      for (let i = 0; i < len; i++)
        res += chars.charAt(Math.floor(Math.random() * chars.length));
      return res;
    },
    mixsmallalphanum: (len) => {
      const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
      let res = "";
      for (let i = 0; i < len; i++)
        res += chars.charAt(Math.floor(Math.random() * chars.length));
      return res;
    },
    mixbigalphanum: (len) => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let res = "";
      for (let i = 0; i < len; i++)
        res += chars.charAt(Math.floor(Math.random() * chars.length));
      return res;
    },
    mixall: (len) => {
      const chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let res = "";
      for (let i = 0; i < len; i++)
        res += chars.charAt(Math.floor(Math.random() * chars.length));
      return res;
    },
    hexdigit: (len) => {
      const chars = "0123456789ABCDEF";
      let res = "";
      for (let i = 0; i < len; i++)
        res += chars.charAt(Math.floor(Math.random() * chars.length));
      return res;
    },
    ascii2hex: (str) => {
      return Array.from(str)
        .map(
          (char) =>
            "=" +
            char.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0"),
        )
        .join("");
    },
    RFC_Date_UTC: () => new Date().toUTCString(),
    RFC_Date_IST: () => {
      const date = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istDate = new Date(date.getTime() + istOffset);
      return istDate.toUTCString().replace("GMT", "+0530");
    },
    RFC_Date_EST: () => {
      const date = new Date();
      const estOffset = -5 * 60 * 60 * 1000;
      const estDate = new Date(date.getTime() + estOffset);
      return estDate.toUTCString().replace("GMT", "-0500");
    },
    RFC_Date_EDT: () => {
      const date = new Date();
      const edtOffset = -4 * 60 * 60 * 1000;
      const edtDate = new Date(date.getTime() + edtOffset);
      return edtDate.toUTCString().replace("GMT", "-0400");
    },
    mixchar: (len) => {
      const chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let res = "";
      for (let i = 0; i < len; i++)
        res += chars.charAt(Math.floor(Math.random() * chars.length));
      return res;
    },
    mixallchar: (len) => {
      const chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
      let res = "";
      for (let i = 0; i < len; i++)
        res += chars.charAt(Math.floor(Math.random() * chars.length));
      return res;
    },
    strToUue: (str) => {
      // Simple implementation of PHP's convert_uuencode
      const e = process.version
        ? Buffer.from(str)
        : new TextEncoder().encode(str);
      let uue = "";
      for (let i = 0; i < e.length; i += 45) {
        const chunk = e.slice(i, i + 45);
        let encoded = String.fromCharCode(chunk.length + 32);
        for (let j = 0; j < chunk.length; j += 3) {
          const b1 = chunk[j];
          const b2 = chunk[j + 1] || 0;
          const b3 = chunk[j + 2] || 0;

          const o1 = b1 >> 2;
          const o2 = ((b1 & 3) << 4) | (b2 >> 4);
          const o3 = ((b2 & 15) << 2) | (b3 >> 6);
          const o4 = chunk.length > j + 2 ? b3 & 63 : 64; // Handle padding gracefully

          encoded += String.fromCharCode(o1 === 0 ? 96 : o1 + 32);
          encoded += String.fromCharCode(o2 === 0 ? 96 : o2 + 32);
          encoded +=
            chunk.length > j + 1
              ? String.fromCharCode(o3 === 0 ? 96 : o3 + 32)
              : "`";
          encoded +=
            chunk.length > j + 2
              ? String.fromCharCode(o4 === 0 ? 96 : o4 + 32)
              : "`";
        }
        uue += encoded + "\n";
      }
      return uue + "`\n";
    },
    quotedPrintableEncode: (str) => {
      // Basic Quoted-Printable encoding approximation
      return str
        .replace(/[^\x21-\x3C\x3E-\x7E\t \r\n]/g, (match) => {
          const hex = match.charCodeAt(0).toString(16).toUpperCase();
          return "=" + (hex.length === 1 ? "0" + hex : hex);
        })
        .replace(/ (?=\r?\n)/g, "=20")
        .replace(/\t(?=\r?\n)/g, "=09");
    },
  },
};

module.exports = TagEngine;
