const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  uploadSuppressionFile,
  saveMapping,
  getMappings,
  deleteMapping,
  queueSuppression,
  getSuppressionQueue,
  deleteQueue,
  getLogs,
  addComplainers,
  getComplainersGrouped,
  getComplainersByOffer,
  deleteComplainer,
} = require("../controllers/suppressionController");

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "suppression/vendor_suppression_uploaded_files";
    if (!require("fs").existsSync(dir)) {
      require("fs").mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.single("file"), uploadSuppressionFile);
router.post("/mapping", saveMapping);
router.get("/mappings", getMappings);
router.delete("/mapping/:id", deleteMapping);
router.post("/queue", queueSuppression);
router.get("/queue", getSuppressionQueue);
router.delete("/queue/:id", deleteQueue);
router.get("/log/:id", getLogs);

// Complainer Suppression Routes
router.post("/complainers", addComplainers);
router.get("/complainers/grouped", getComplainersGrouped);
router.get("/complainers/offer/:offer_id", getComplainersByOffer);
router.delete("/complainers/:id", deleteComplainer);

module.exports = router;
