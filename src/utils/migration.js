const pool = require("../config/mysql");
const Server = require("../models/Server");
const IP = require("../models/IP");
const Log = require("../models/Log");
const mongoose = require("mongoose");

const migrateLegacyData = async () => {
  console.log("--- Starting Legacy Data Migration ---");

  try {
    // DIAGNOSTIC: List Databases
    const [dbs] = await pool.query("SHOW DATABASES");
    console.log(
      "Available Databases:",
      dbs.map((d) => d.Database),
    );

    // 1. Migrate Servers and IPs
    console.log("Checking admin.sending_ip_list...");
    try {
      const [ipRows] = await pool.query("SELECT ip FROM admin.sending_ip_list");
      console.log(`Found ${ipRows.length} IPs in MySQL.`);

      let server = await Server.findOne({ name: "Legacy MySQL Server" });
      if (!server) {
        server = await Server.create({
          name: "Legacy MySQL Server",
          ip: "127.0.0.1",
          status: "active",
        });
        console.log("Created Legacy MySQL Server anchor.");
      }

      let ipCount = 0;
      for (const row of ipRows) {
        const exists = await IP.findOne({ ip: row.ip });
        if (!exists) {
          await IP.create({ ip: row.ip, server: server._id, status: "active" });
          ipCount++;
        }
      }
      console.log(`Migrated ${ipCount} new IPs.`);
    } catch (e) {
      console.error("Error accessing admin.sending_ip_list:", e.message);
    }

    // 2. Migrate Logs (sending stats)
    console.log("Checking report.sending_stats...");
    try {
      const [logRows] = await pool.query(`
              SELECT 
                  a.mailer, a.template_id, a.interface, b.server, a.offer_id, 
                  a.domain, a.from, a.created_at, a.mode, a.sent, a.error
              FROM report.sending_stats AS a
              LEFT JOIN svml.mumara AS b ON a.smtp = b.assignedip
              LIMIT 5000
          `);
      console.log(`Found ${logRows.length} logs in MySQL.`);

      let logCount = 0;
      for (const log of logRows) {
        try {
          await Log.create({
            mailer: log.mailer || "Legacy",
            template_id: log.template_id || "Legacy",
            interface: log.interface || "Legacy",
            server: log.server || "Unknown",
            offer_id: log.offer_id || "Legacy",
            domain: log.domain || "Unknown",
            from: log.from || "Unknown",
            test_sent: log.mode === "test" ? log.sent : 0,
            bulk_test_sent: log.mode === "Bulk Test" ? log.sent : 0,
            bulk_test: log.mode === "Bulk" ? log.sent : 0,
            error: log.error || 0,
            sent_on: log.created_at,
          });
          logCount++;
        } catch (e) {
          // ignore
        }
      }
      console.log(`Migrated ${logCount} log entries.`);
    } catch (e) {
      console.error("Error accessing report.sending_stats:", e.message);
    }
  } catch (error) {
    console.error("Migration fatal error:", error.message);
    throw error;
  } finally {
    console.log("--- Migration Finished ---");
  }
};

module.exports = { migrateLegacyData };
