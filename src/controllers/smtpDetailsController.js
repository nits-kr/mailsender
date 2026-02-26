const SmtpDetail = require("../models/SmtpDetail");

// @desc    Get SMTP details
// @route   GET /api/smtp/details
// @access  Private
const getSmtpDetails = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const isAdmin =
      req.user.designation === "Admin" || req.user.designation === "admin";
    const data = rows.map((r) => ({
      _id: r._id,
      sno: r._id,
      assignedip: r.assignedip,
      server: r.server,
      hostname: r.hostname,
      user: r.user,
      pass: r.pass,
      port: r.port,
      tls: r.tls,
      accountname: r.accountname?._id || r.accountname,
      name: r.accountname?.name || "",
    }));

    res.json(data);
  } catch (error) {
    console.error("Error fetching SMTP details:", error);
    res
      .status(500)
      .json({ message: "Error fetching SMTP details", error: error.message });
  }
};

// @desc    Add or Update SMTP details
// @route   POST /api/smtp/details
// @access  Private
const addSmtpDetails = async (req, res) => {
  try {
    const { server, assign, ip: ipText } = req.body;

    if (!ipText || !server || !assign) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const ips = ipText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);
    const results = [];

    for (const aip of ips) {
      const parts = aip.split("|").map((part) => part.trim());

      if (parts.length === 6) {
        const [ip, host, user, pass, port, tls] = parts;

        const existing = await SmtpDetail.findOne({ assignedip: ip });

        if (!existing) {
          // Insert
          await SmtpDetail.create({
            assignedip: ip,
            server,
            hostname: host,
            user,
            pass,
            port,
            tls,
            accountname: assign,
          });
          results.push({
            ip,
            status: "INSERTED",
            message: "Credentials Inserted",
          });
        } else {
          // Update
          await SmtpDetail.findOneAndUpdate(
            { assignedip: ip },
            { accountname: assign, hostname: host, user, pass, port, tls },
            { new: true },
          );
          results.push({
            ip,
            status: "UPDATED",
            message: "Credentials UPDATED",
          });
        }
      } else {
        results.push({
          ip: aip,
          status: "FAILED",
          message: "Invalid format. Must be IP|HOSTNAME|USER|PASS|PORT|TLS",
        });
      }
    }

    res.json({ message: "Processed SMTP Details", results });
  } catch (error) {
    console.error("Error adding SMTP details:", error);
    res
      .status(500)
      .json({ message: "Error adding SMTP details", error: error.message });
  }
};

// @desc    Delete SMTP details
// @route   DELETE /api/smtp/details/:id
// @access  Private/Admin
const deleteSmtpDetails = async (req, res) => {
  try {
    // Legacy code restricted delete to Admins only
    if (req.user.designation !== "Admin" && req.user.designation !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete" });
    }

    const deleted = await SmtpDetail.findByIdAndDelete(req.params.sno);
    if (!deleted) {
      return res.status(404).json({ message: "SMTP detail not found" });
    }

    res.json({ message: "SMTP Details removed" });
  } catch (error) {
    console.error("Error deleting SMTP details:", error);
    res
      .status(500)
      .json({ message: "Error deleting SMTP details", error: error.message });
  }
};

module.exports = {
  getSmtpDetails,
  addSmtpDetails,
  deleteSmtpDetails,
};
