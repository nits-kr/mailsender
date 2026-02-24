const Server = require("../models/Server");
const IP = require("../models/IP");

// @desc    Get all servers with their IPs
// @route   GET /api/servers
const getServers = async (req, res) => {
  try {
    const servers = await Server.find({});
    const ips = await IP.find({});

    const results = servers.map((server) => ({
      ...server._doc,
      ips: ips.filter((ip) => ip.server.toString() === server._id.toString()),
    }));

    res.json(results);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching servers", error: error.message });
  }
};

// @desc    Add a new server
// @route   POST /api/servers
const addServer = async (req, res) => {
  const { name, ip, ssh_password } = req.body;
  try {
    const server = await Server.create({ name, ip, ssh_password });
    res.status(201).json(server);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error adding server", error: error.message });
  }
};

// @desc    Add an IP to a server
// @route   POST /api/servers/:serverId/ips
const addIP = async (req, res) => {
  const { ip } = req.body;
  const { serverId } = req.params;
  try {
    const newIP = await IP.create({ ip, server: serverId });
    res.status(201).json(newIP);
  } catch (error) {
    res.status(400).json({ message: "Error adding IP", error: error.message });
  }
};

module.exports = { getServers, addServer, addIP };
