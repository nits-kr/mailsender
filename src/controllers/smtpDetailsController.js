const pool = require("../config/mysql");

// @desc    Get SMTP details
// @route   GET /api/smtp/details
// @access  Private
const getSmtpDetails = async (req, res) => {
  try {
    const isAdmin =
      req.user.designation === "Admin" || req.user.designation === "admin";
    const userId = req.user.id;

    let query;
    let params = [];

    if (isAdmin) {
      query = `
        SELECT t2.sno, t2.hostname, t2.server, t2.user, t2.pass, t2.port, t2.tls, t2.assignedip, t2.accountname, t1.name 
        FROM \`login\`.\`users\` t1 
        JOIN \`svml\`.\`mumara\` t2 ON t1.id = t2.accountname
        ORDER BY t2.sno DESC
      `;
    } else {
      query = `
        SELECT t2.sno, t2.hostname, t2.server, t2.user, t2.pass, t2.port, t2.tls, t2.assignedip, t2.accountname, t1.name 
        FROM \`login\`.\`users\` t1 
        JOIN \`svml\`.\`mumara\` t2 ON t1.id = t2.accountname 
        WHERE t1.id = ?
        ORDER BY t2.sno DESC
      `;
      params = [userId];
    }

    const [rows] = await pool.query(query, params);

    res.json(rows);
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

        // Check if IP exist
        const [existing] = await pool.query(
          "SELECT assignedip FROM \`svml\`.\`mumara\` WHERE assignedip = ?",
          [ip],
        );

        if (existing.length === 0) {
          // Insert
          await pool.query(
            "INSERT INTO \`svml\`.\`mumara\` (assignedip, server, hostname, user, pass, port, tls, accountname) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [ip, server, host, user, pass, port, tls, assign],
          );
          results.push({
            ip,
            status: "INSERTED",
            message: "Credentials Inserted",
          });
        } else {
          // Update
          await pool.query(
            "UPDATE \`svml\`.\`mumara\` SET accountname = ?, hostname = ?, user = ?, pass = ?, port = ?, tls = ? WHERE assignedip = ?",
            [assign, host, user, pass, port, tls, ip],
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
// @route   DELETE /api/smtp/details/:sno
// @access  Private/Admin
const deleteSmtpDetails = async (req, res) => {
  try {
    const sno = req.params.sno;

    // Legacy code restricted delete to Admins only
    if (req.user.designation !== "Admin" && req.user.designation !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete" });
    }

    await pool.query("DELETE FROM \`svml\`.\`mumara\` WHERE sno = ?", [sno]);

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
