const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "test_data");
const BUFFER_PATH = path.join(DATA_PATH, "buffer");
const filename = "masked_file.txt";

const primaryPath = path.join(DATA_PATH, filename);
const bufferFallbackPath = path.join(BUFFER_PATH, filename);

// Setup
if (!fs.existsSync(BUFFER_PATH)) fs.mkdirSync(BUFFER_PATH, { recursive: true });

// Scenario: Primary is empty (0 bytes), Buffer has data
fs.writeFileSync(primaryPath, "", "utf8");
fs.writeFileSync(bufferFallbackPath, "line1\nline2\n", "utf8");

// Logic to test (extracted from getFileInfo)
const test_resolvePath = (primaryPath, bufferFallbackPath) => {
  let filePath = null;
  const primaryExists = fs.existsSync(primaryPath);
  const bufferExists = fs.existsSync(bufferFallbackPath);

  if (primaryExists && bufferExists) {
    const primarySize = fs.statSync(primaryPath).size;
    const bufferSize = fs.statSync(bufferFallbackPath).size;
    // Prefer non-empty file
    filePath =
      primarySize === 0 && bufferSize > 0 ? bufferFallbackPath : primaryPath;
  } else if (primaryExists) {
    filePath = primaryPath;
  } else if (bufferExists) {
    filePath = bufferFallbackPath;
  }
  return filePath;
};

const resolved = test_resolvePath(primaryPath, bufferFallbackPath);
console.log(`Resolved Path: ${resolved}`);

if (resolved === bufferFallbackPath) {
  console.log(
    "TEST PASSED: Prefered non-empty buffer file over empty primary file.",
  );
} else {
  console.error("TEST FAILED: Did not prefer non-empty buffer file.");
  process.exit(1);
}

// Cleanup
fs.unlinkSync(primaryPath);
fs.unlinkSync(bufferFallbackPath);
fs.rmdirSync(BUFFER_PATH);
fs.rmdirSync(DATA_PATH);
