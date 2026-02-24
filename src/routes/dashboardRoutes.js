const express = require("express");
const { getStats, getLogs } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/stats", getStats);
router.get("/logs", getLogs);

module.exports = router;
