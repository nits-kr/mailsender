const express = require("express");
const router = express.Router();
const {
  setupServer,
  getSqlFiles,
} = require("../controllers/serverSetupController");
const { protect } = require("../middleware/authMiddleware");

router.post("/setup", setupServer);
router.get("/sql-files", getSqlFiles);

module.exports = router;
