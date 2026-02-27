const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const DataFile = require("../models/DataFile");
const Offer = require("../models/Offer");
const OfferSuppMapping = require("../models/OfferSuppMapping");
const ComplainerSuppression = require("../models/ComplainerSuppression");
const axios = require("axios");
const { DATA_PATH, BUFFER_PATH } = require("../config/paths");

// @desc    Get data file list and counts
// @route   GET /api/data/count
// @access  Private
const getDataCount = async (req, res) => {
  const bufferPath = BUFFER_PATH;
  const dataPath = DATA_PATH;

  // Always fetch DB-tracked files for display names
  const dbFiles = await DataFile.find({ type: "data" });
  const dbMap = {};
  dbFiles.forEach((f) => {
    dbMap[f.filename] = f;
  });

  if (!fs.existsSync(dataPath)) {
    // Development/Windows: return only DB records
    return res.json(
      dbFiles.map((f) => ({
        date: f.createdAt.toLocaleDateString(),
        time: f.createdAt.toLocaleTimeString(),
        filename: f.filename,
        display_name: f.display_name || f.filename,
        count: f.count,
      })),
    );
  }

  // Scan both dataPath root AND buffer subdir for source files
  // Exclude hex-only filenames (those are extraction outputs, not source data)
  const hexOnlyPattern = /^[a-f0-9]{32}\.txt$/i;
  const scanDirs = [dataPath, bufferPath].filter((d) => fs.existsSync(d));
  let allFsFiles = [];

  for (const dir of scanDirs) {
    try {
      const entries = fs.readdirSync(dir);
      entries.forEach((entry) => {
        const fullPath = path.join(dir, entry);
        if (
          fs.statSync(fullPath).isFile() &&
          entry.endsWith(".txt") &&
          !hexOnlyPattern.test(entry)
        ) {
          allFsFiles.push(fullPath);
        }
      });
    } catch (_) {}
  }

  // Deduplicate by basename (root takes priority over buffer for same name)
  const seen = new Set();
  const fsFiles = allFsFiles.filter((f) => {
    const base = path.basename(f);
    if (seen.has(base)) return false;
    seen.add(base);
    return true;
  });

  const fsFilenameSet = new Set(fsFiles.map((f) => path.basename(f)));

  // Include DB files not found on disk (e.g. upload metadata without physical file)
  const extraDbFiles = dbFiles
    .filter((f) => !fsFilenameSet.has(f.filename))
    .map((f) => ({
      date: f.createdAt.toLocaleDateString(),
      time: f.createdAt.toLocaleTimeString(),
      filename: f.filename,
      display_name: f.display_name || f.filename,
      count: f.count,
    }));

  if (fsFiles.length === 0) {
    return res.json(extraDbFiles);
  }

  const results = [];
  let processed = 0;

  fsFiles.forEach((file) => {
    const countCommand = `wc -l "${file}" | awk '{print $1}'`;
    const stats = fs.statSync(file);
    const date = stats.mtime.toLocaleDateString();
    const time = stats.mtime.toLocaleTimeString();
    const basename = path.basename(file);
    const dbRecord = dbMap[basename];

    exec(countCommand, (cError, cStdout) => {
      processed++;
      if (!cError) {
        results.push({
          date,
          time,
          filename: basename,
          display_name: dbRecord?.display_name || basename,
          count: parseInt(cStdout.trim()) || 0,
        });
      }

      if (processed === fsFiles.length) {
        res.json([...results, ...extraDbFiles]);
      }
    });
  });
};

// @desc    Download data with suppression logic
// @route   POST /api/data/download
// @access  Private
const downloadData = async (req, res) => {
  const { filenames, count, type, times, ip, offer_id, selector } = req.body;

  const extractCount = parseInt(count) || 10000;
  const loopTimes = parseInt(times) || 1;
  const isRandom = type !== "Not Random";
  const downloadId = require("crypto").randomBytes(16).toString("hex");
  const resultFilename = `${downloadId}.txt`;
  const dataPath = DATA_PATH;
  const bufferPath = BUFFER_PATH;

  if (!fs.existsSync(bufferPath)) {
    fs.mkdirSync(bufferPath, { recursive: true });
  }

  try {
    // 1. Read all lines from the selected files
    // Files may be in DATA_PATH root OR DATA_PATH/buffer (depends on how they were uploaded/placed)
    let allLines = [];
    for (const filename of filenames) {
      const primaryPath = path.join(dataPath, filename);
      const bufferFallbackPath = path.join(bufferPath, filename);

      let filePath = null;
      if (fs.existsSync(primaryPath)) {
        filePath = primaryPath;
      } else if (fs.existsSync(bufferFallbackPath)) {
        filePath = bufferFallbackPath;
      }

      if (!filePath) {
        console.warn(
          `File not found in either location: ${primaryPath} or ${bufferFallbackPath}`,
        );
        continue;
      }

      const content = fs.readFileSync(filePath, "utf8");
      const lines = content
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      allLines = allLines.concat(lines);
    }

    if (allLines.length === 0) {
      return res.status(400).json({
        message: "No data found in selected files",
        filename: null,
        finalCount: 0,
        suppCount: 0,
      });
    }

    // 2. Shuffle if Random mode
    if (isRandom) {
      for (let i = allLines.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allLines[i], allLines[j]] = [allLines[j], allLines[i]];
      }
    }

    // 3. Extract 'count' lines, repeated 'times' times
    const extracted = [];
    for (let t = 0; t < loopTimes; t++) {
      const slice = allLines.slice(0, extractCount);
      extracted.push(...slice);
    }

    // 4. Format output based on selector
    const outputLines = extracted.map((line) => {
      if (selector === "both") {
        const crypto = require("crypto");
        const md5 = crypto.createHash("md5").update(line).digest("hex");
        return `${line}|${md5}`;
      }
      return line;
    });

    // 5. Write to buffer file
    const outputPath = path.join(bufferPath, resultFilename);
    fs.writeFileSync(outputPath, outputLines.join("\n") + "\n", "utf8");

    res.json({
      message: "Data extraction started",
      filename: resultFilename,
      finalCount: outputLines.length,
      suppCount: 0,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error generating download file",
      error: error.message,
    });
  }
};

// @desc    Upload data to DB
// @route   POST /api/data/upload
// @access  Private
const uploadData = async (req, res) => {
  const { displayName, mode } = req.body;
  const file = req.file;

  if (!file || !displayName) {
    return res
      .status(400)
      .json({ message: "File and display name are required" });
  }

  try {
    // Count the actual number of non-empty lines in the uploaded file
    let lineCount = 0;
    try {
      const content = fs.readFileSync(file.path, "utf8");
      lineCount = content
        .split("\n")
        .filter((line) => line.trim().length > 0).length;
    } catch (readErr) {
      console.warn("Could not count lines for uploaded file:", readErr.message);
    }

    // Use upsert so re-uploading a file with the same name updates it instead of throwing a duplicate key error
    const updatedFile = await DataFile.findOneAndUpdate(
      { filename: file.originalname },
      {
        $set: {
          filename: file.originalname,
          display_name: displayName,
          type: "data",
          count: lineCount,
        },
      },
      { upsert: true, new: true },
    );

    res.status(201).json({
      message: "File uploaded and recorded successfully",
      file: updatedFile,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error uploading data", error: error.message });
  }
};

// @desc    Split data file
// @route   POST /api/data/split
// @access  Private
const splitData = async (req, res) => {
  const { filename, count } = req.body;
  const dataPath = process.env.DATA_PATH || "/var/www/data/";
  const filePath = path.join(dataPath, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Source file not found" });
  }

  // Create a sub-folder for shards to keep things clean
  const shardFolder = `${filename}_shards`;
  const shardPath = path.join(dataPath, shardFolder);
  if (!fs.existsSync(shardPath)) {
    fs.mkdirSync(shardPath, { recursive: true });
  }

  // Use Linux 'split' command for maximum performance
  const command = `split -l ${count} ${filePath} ${shardPath}/shard_`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ message: "Split failed", error: stderr });
    }
    res.json({
      message: `File split successfully. Shards generated in ${shardFolder}/`,
      directory: shardFolder,
    });
  });
};

// @desc    Merge data files
// @route   POST /api/data/merge
// @access  Private
const mergeData = async (req, res) => {
  const { filenames } = req.body;
  const dataPath = DATA_PATH;

  if (!filenames || filenames.length === 0) {
    return res.status(400).json({ message: "No files selected for merge" });
  }

  // Professional unique naming for merged output
  const mergeId = require("crypto").randomBytes(8).toString("hex");
  const outputFilename = `merged_${mergeId}.txt`;
  const outputPath = path.join(dataPath, outputFilename);

  // Construct files string: file1 file2 file3
  const filesString = filenames.map((f) => path.join(dataPath, f)).join(" ");

  // Use 'cat' for high-speed merge
  const command = `cat ${filesString} > ${outputPath}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ message: "Merge failed", error: stderr });
    }
    res.json({
      message: "Files merged successfully",
      output_file: outputFilename,
      mergedCount: filenames.length,
    });
  });
};

const EmailMaster = require("../models/EmailMaster");

// @desc    Bounce/Complain update
// @route   POST /api/data/status-update
// @access  Private
const updateStatus = async (req, res) => {
  const { ids, type } = req.body; // type: 'bounce' or 'complain'

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "No email identifiers provided" });
  }

  const statusChar = type === "bounce" ? "B" : "C";

  try {
    const result = await EmailMaster.updateMany(
      { email: { $in: ids.map((id) => id.toLowerCase()) } },
      { $set: { status: statusChar } },
    );

    res.json({
      message: `${type.toUpperCase()} update completed`,
      totalCount: ids.length,
      updatedCount: result.modifiedCount || 0,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error updating ${type} status`,
      error: error.message,
    });
  }
};

// @desc    Fetch bounce from server
// @route   POST /api/data/fetch-bounce
// @access  Private
const fetchBounce = async (req, res) => {
  const { server, date } = req.body;
  res.json({ message: `Bounce fetch started for server ${server} on ${date}` });
};

// @desc    Get Data Analytics (Opener/Clicker)
// @route   POST /api/data/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  const { type, offer_id, isp, timeframe } = req.body;
  res.json({ count: 1234, message: "Analytics data retrieved" });
};

// @desc    Delete data file
// @route   DELETE /api/data/:filename
// @access  Private
const deleteData = async (req, res) => {
  const { filename } = req.params;
  const dataPath = DATA_PATH;
  const filePath = path.join(dataPath, filename);
  const bufferPath = path.join(BUFFER_PATH, filename);

  try {
    // 1. Delete from Database
    await DataFile.findOneAndDelete({ filename });

    // 2. Delete Physical File from MAIN path
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 3. Delete from BUFFER path (if it's an extracted file)
    if (fs.existsSync(bufferPath)) {
      fs.unlinkSync(bufferPath);
    }

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting file", error: error.message });
  }
};

// @desc    Get generated file content
// @route   POST /api/data/get-generated
// @access  Private
const getGeneratedFile = async (req, res) => {
  const { filename } = req.body;
  const filePath = path.join(BUFFER_PATH, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    res.json({ content });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error reading file", error: error.message });
  }
};

// @desc    List all generated (buffer) files
// @route   GET /api/data/buffer-files
// @access  Private
const getBufferFiles = async (req, res) => {
  const bufferPath = BUFFER_PATH;

  if (!fs.existsSync(bufferPath)) {
    return res.json([]);
  }

  try {
    const files = fs.readdirSync(bufferPath).filter((f) => f.endsWith(".txt"));
    const result = files.map((filename) => {
      const filePath = path.join(bufferPath, filename);
      const stats = fs.statSync(filePath);
      let lineCount = 0;
      try {
        const content = fs.readFileSync(filePath, "utf8");
        lineCount = content.split("\n").filter((l) => l.trim()).length;
      } catch (_) {}
      return {
        filename,
        size: stats.size,
        count: lineCount,
        date: stats.mtime.toLocaleDateString(),
        time: stats.mtime.toLocaleTimeString(),
      };
    });
    // Sort newest first
    result.sort(
      (a, b) =>
        new Date(b.date + " " + b.time) - new Date(a.date + " " + a.time),
    );
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error listing buffer files", error: error.message });
  }
};

// @desc    Delete a generated buffer file
// @route   DELETE /api/data/buffer-files/:filename
// @access  Private
const deleteBufferFile = async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(BUFFER_PATH, filename);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting buffer file", error: error.message });
  }
};

module.exports = {
  getDataCount,
  downloadData,
  uploadData,
  splitData,
  mergeData,
  updateStatus,
  fetchBounce,
  getAnalytics,
  deleteData,
  getGeneratedFile,
  getBufferFiles,
  deleteBufferFile,
};
