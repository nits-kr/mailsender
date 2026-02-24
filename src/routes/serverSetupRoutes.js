const express = require("express");
const { setupServer } = require("../controllers/serverSetupController");

const router = express.Router();

router.post("/setup", setupServer);

module.exports = router;
