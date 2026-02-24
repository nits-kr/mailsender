const express = require("express");
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
} = require("../controllers/dataController");

const router = express.Router();

router.get("/count", getDataCount);
router.post("/download", downloadData);
router.post("/upload", uploadData);
router.post("/split", splitData);
router.post("/merge", mergeData);
router.post("/status-update", updateStatus);
router.post("/fetch-bounce", fetchBounce);
router.post("/analytics", getAnalytics);
router.delete("/:filename", deleteData);

module.exports = router;
