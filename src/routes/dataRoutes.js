const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
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
} = require("../controllers/dataController");

const { DATA_PATH } = require("../config/paths");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(DATA_PATH)) {
      fs.mkdirSync(DATA_PATH, { recursive: true });
    }
    cb(null, DATA_PATH);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/count", getDataCount);
router.post("/download", downloadData);
router.post("/upload", upload.single("file"), uploadData);
router.post("/split", splitData);
router.post("/merge", mergeData);
router.post("/status-update", updateStatus);
router.post("/fetch-bounce", fetchBounce);
router.post("/analytics", getAnalytics);
router.post("/get-generated", getGeneratedFile);
router.get("/buffer-files", getBufferFiles);
router.delete("/buffer-files/:filename", deleteBufferFile);
router.delete("/:filename", deleteData);

module.exports = router;
