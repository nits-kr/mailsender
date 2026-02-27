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

    // 2. Process Static Tags: ((tag))
    processedText = processedText.replace(/\(\((.*?)\)\)/gi, (match, p1) => {
      const tagName = p1.trim();
      if (tagName === "_track_") {
        const email = context.email || "";
        return crypto.createHash("md5").update(email).digest("hex");
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
  },
};

module.exports = TagEngine;
