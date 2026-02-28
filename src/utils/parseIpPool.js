/**
 * parseIpPool.js
 *
 * Parses the ADMIN textarea content into a structured IP pool.
 * Supports two formats:
 *
 * Format 1 (pipe-separated):
 *   185.211.6.101|sender1@domain.com
 *
 * Format 2 (3-line groups):
 *   185.211.6.102
 *   sender2@domain.com
 *   AliUSA10
 */

const IP_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @param {string} raw - Raw textarea content
 * @returns {{ ip: string, from_email: string, from_name?: string }[]}
 */
function parseIpPool(raw) {
  if (!raw) return [];

  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean); // remove empty lines

  const pool = [];

  // Check if ANY line contains a pipe → treat ALL pipe lines as Format 1
  // Non-pipe lines get grouped into Format 2 blocks of 2–3 lines
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line.includes("|")) {
      // ── Format 1: IP|from-email ──────────────────────────────────────
      const parts = line.split("|").map((p) => p.trim());
      const ip = parts[0];
      const from_email = parts[1] || "";

      if (ip && EMAIL_REGEX.test(from_email)) {
        pool.push({ ip, from_email });
      } else {
        console.warn(`[parseIpPool] Skipping invalid Format 1 line: "${line}"`);
      }
      i++;
    } else if (IP_REGEX.test(line)) {
      // ── Format 2: 3-line group starting with IP ───────────────────────
      const ip = line;
      const from_email = (lines[i + 1] || "").trim();
      const from_name = (lines[i + 2] || "").trim();

      if (EMAIL_REGEX.test(from_email)) {
        const entry = { ip, from_email };
        if (
          from_name &&
          !IP_REGEX.test(from_name) &&
          !from_name.includes("|")
        ) {
          entry.from_name = from_name;
          i += 3;
        } else {
          i += 2;
        }
        pool.push(entry);
      } else {
        i++;
      }
    } else {
      // ── Format 3: Custom Alias / SMTP Name (e.g. "AliUSA10") ──────────
      // If it's a single word/string without special chars, allow it
      if (line.length > 0 && !line.includes("|") && !line.includes(" ")) {
        pool.push({ ip: line, from_email: "" });
      }
      i++;
    }
  }

  return pool;
}

module.exports = { parseIpPool };
