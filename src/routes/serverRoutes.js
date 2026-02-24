const express = require("express");
const {
  getServers,
  addServer,
  addIP,
} = require("../controllers/serverController");

const router = express.Router();

router.get("/", getServers);
router.post("/", addServer);
router.post("/:serverId/ips", addIP);

module.exports = router;
