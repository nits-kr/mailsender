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
    console.log("Paths: Using Linux path /var/www/data");
  } else {
    DATA_PATH = path.join(__dirname, "../../data");
    console.log("Paths: Using project path:", DATA_PATH);
  }
} else {
  console.log("Paths: Using process.env.DATA_PATH:", DATA_PATH);
}

const BUFFER_PATH = path.join(DATA_PATH, "buffer");

module.exports = {
  DATA_PATH,
  BUFFER_PATH,
};
