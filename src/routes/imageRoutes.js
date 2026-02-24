const express = require("express");
const router = express.Router();
const {
  uploadImage,
  uploadMiddleware,
} = require("../controllers/imageController");

router.post("/upload", uploadMiddleware, uploadImage);

module.exports = router;
