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

  if (!fs.existsSync(dataPath)) {
    // Return mock data if path doesn't exist (e.g., development on Windows)
    const mockFiles = await DataFile.find({ type: "data" });
    return res.json(
      mockFiles.map((f) => ({
        date: f.createdAt.toLocaleDateString(),
        time: f.createdAt.toLocaleTimeString(),
        filename: f.filename,
        count: f.count,
      })),
    );
  }

  const command = `find ${dataPath} -mtime -15 -type f`;

  exec(command, async (error, stdout, stderr) => {
    if (error) {
      return res
        .status(500)
        .json({ message: "Error fetching data files", error: stderr });
    }

    const files = stdout
      .trim()
      .split("\n")
      .filter((f) => f);
    if (files.length === 0) return res.json([]);

    const results = [];
    let processed = 0;

    files.forEach((file) => {
      const countCommand = `wc -l ${file} | awk '{print $1}'`;
      const stats = fs.statSync(file);
      const date = stats.mtime.toLocaleDateString();
      const time = stats.mtime.toLocaleTimeString();

      exec(countCommand, (cError, cStdout, cStderr) => {
        processed++;
        if (!cError) {
          results.push({
            date,
            time,
            filename: path.basename(file),
            count: parseInt(cStdout.trim()),
          });
        }

        if (processed === files.length) {
          res.json(results);
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
    const newFile = await DataFile.create({
      filename: file.originalname,
      display_name: displayName,
      type: "data",
      count: 0, // In a real scenario, we'd count lines here
    });

    res.status(201).json({
      message: "File uploaded and recorded successfully",
      file: newFile,
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
  // Implement shell command: split -l count filename
  res.json({
    message: `Split initiated for ${filename} with ${count} records per file`,
  });
};

// @desc    Merge data files
// @route   POST /api/data/merge
// @access  Private
const mergeData = async (req, res) => {
  const { filenames } = req.body;
  // Implement shell command: cat filenames > merged.txt
  res.json({
    message: "Files merged successfully",
    output_file: "merged_output.txt",
  });
};

// @desc    Bounce/Complain update
// @route   POST /api/data/status-update
// @access  Private
const updateStatus = async (req, res) => {
  const { ids, type } = req.body; // type: 'bounce' or 'complain'
  res.json({ message: `${type} update successful for ${ids.length} records` });
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
