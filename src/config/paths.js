const path = require("path");

// Centralized data path configuration
// 1. Check environment variable DATA_PATH or DATA_FILE_PATH
// 2. Check if /var/www/data exists (common server path)
// 3. Fallback to project-relative data directory
let DATA_PATH = process.env.DATA_PATH || process.env.DATA_FILE_PATH;

if (!DATA_PATH) {
  const linuxPath = "/var/www/data";
  const fs = require("fs");
  if (fs.existsSync(linuxPath)) {
    DATA_PATH = linuxPath;
    console.log("Paths: Using default Linux path /var/www/data");
  } else {
    DATA_PATH = path.join(__dirname, "../../data");
    console.log("Paths: Using default project path:", DATA_PATH);
  }
} else {
  console.log("Paths: Using environment variable for DATA_PATH:", DATA_PATH);
}

const BUFFER_PATH = path.join(DATA_PATH, "buffer");
const SUPPRESSION_DIR = path.join(
  __dirname,
  "../../suppression/vendor_suppression_uploaded_files",
);

module.exports = {
  DATA_PATH,
  BUFFER_PATH,
  SUPPRESSION_DIR,
};
