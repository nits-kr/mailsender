const path = require("path");

// Centralized data path configuration
// 1. Check environment variable DATA_PATH
// 2. Check if /var/www/data exists (common server path)
// 3. Fallback to project-relative data directory
let DATA_PATH = process.env.DATA_PATH;

if (!DATA_PATH) {
  const linuxPath = "/var/www/data";
  const fs = require("fs");
  if (fs.existsSync(linuxPath)) {
    DATA_PATH = linuxPath;
  } else {
    DATA_PATH = path.join(__dirname, "../../data");
  }
}

const BUFFER_PATH = path.join(DATA_PATH, "buffer");

module.exports = {
  DATA_PATH,
  BUFFER_PATH,
};
