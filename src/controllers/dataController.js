const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const DataFile = require("../models/DataFile");
const Offer = require("../models/Offer");
const OfferSuppMapping = require("../models/OfferSuppMapping");
const ComplainerSuppression = require("../models/ComplainerSuppression");
const axios = require("axios");

// @desc    Get data file list and counts
// @route   GET /api/data/count
// @access  Private
const getDataCount = async (req, res) => {
  const dataPath = process.env.DATA_PATH || "/var/www/data/";

  // Always fetch DB-tracked files for display names and to ensure uploaded
  // files appear even if the filesystem scan misses them
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

  const command = `find ${dataPath} -maxdepth 1 -type f`;

  exec(command, async (error, stdout, stderr) => {
    if (error) {
      return res
        .status(500)
        .json({ message: "Error fetching data files", error: stderr });
    }

    const fsFiles = stdout
      .trim()
      .split("\n")
      .filter((f) => f && !f.includes("/buffer"));

    // Build a set of filenames found on disk
    const fsFilenameSet = new Set(fsFiles.map((f) => path.basename(f)));

    // Also include DB files that may not be on disk yet (or path mismatch)
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
      const countCommand = `wc -l ${file} | awk '{print $1}'`;
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
  });
};

// @desc    Download data with suppression logic
// @route   POST /api/data/download
// @access  Private
const downloadData = async (req, res) => {
  const { filenames, count, type, times, ip, offer_id, selector } = req.body;

  // Placeholder for suppression logic (FBL, Supp, Unsub)
  // In a real scenario, this would involve complex SQL/Mongo queries
  // For now, we'll simulate the file generation
  // use a robust unique ID (MD5 style) for professional enterprise naming
  const downloadId = require("crypto").randomBytes(16).toString("hex");
  const resultFilename = `${downloadId}.txt`;
  const dataPath = process.env.DATA_PATH || "/var/www/data/";
  const bufferPath = path.join(dataPath, "buffer");

  if (!fs.existsSync(bufferPath)) {
    fs.mkdirSync(bufferPath, { recursive: true });
  }

  try {
    // Simulate data extraction
    const mockContent = "email1@example.com\nemail2@example.com\n";
    fs.writeFileSync(path.join(bufferPath, resultFilename), mockContent);

    res.json({
      message: "Data extraction started",
      filename: resultFilename,
      finalCount: 2, // Mock count
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
  const dataPath = process.env.DATA_PATH || "/var/www/data/";

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
  const dataPath = process.env.DATA_PATH || "/var/www/data/";
  const filePath = path.join(dataPath, filename);
  const bufferPath = path.join(dataPath, "buffer", filename);

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
  const dataPath = process.env.DATA_PATH || "/var/www/data/";
  const filePath = path.join(dataPath, "buffer", filename);

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
};
