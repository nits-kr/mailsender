const fs = require("fs");
const readline = require("readline");
const mongoose = require("mongoose");
const Log = require("./src/models/Log");
const Server = require("./src/models/Server");
const IP = require("./src/models/IP");
require("dotenv").config();

const SQL_FILE = "all_tar/DB_back/all_data.sql";

const runMigration = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    let server = await Server.findOne({ name: "Legacy MySQL Server" });
    if (!server) {
      server = await Server.create({
        name: "Legacy MySQL Server",
        ip: "127.0.0.1",
        status: "active",
      });
      console.log("Created Legacy MySQL Server anchor.");
    }

    const sqlFiles = [
      "all_tar/DB_back/all_data.sql",
      "all_tar/DB_back/admin.sql",
      "all_tar/DB_back/imap_data_new.sql",
      "all_tar/DB_back/login.sql",
      "all_tar/DB_back/offer_module.sql",
      "all_tar/DB_back/sentora_complainer.sql",
      "all_tar/DB_back/suppression_v2.sql",
      "Data_Download/db_schema.sql",
    ];

    let logCount = 0;
    const tableRegex = /INSERT\s+INTO\s+(`?\w+`?)/i;

    for (const sqlFile of sqlFiles) {
      console.log(`Checking file: ${sqlFile}...`);
      if (!fs.existsSync(sqlFile)) continue;

      const fileStream = fs.createReadStream(sqlFile);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      let batch = [];
      const BATCH_SIZE = 500;

      for await (const line of rl) {
        if (line.includes("INSERT")) {
          const match = line.match(tableRegex);
          if (match) {
            const foundTable = match[1].replace(/`/g, "").toLowerCase();
            // ONLY log once per table to avoid spam
            if (!batch.length)
              console.log(`Found data for table: ${foundTable}`);

            if (
              foundTable === "sending_stats" ||
              foundTable === "sending_log" ||
              foundTable === "stats" ||
              foundTable === "emailmaster"
            ) {
              const values = extractValues(line);
              for (const val of values) {
                const mapped = mapToLog(val, foundTable);
                if (mapped && Object.keys(mapped).length > 0) {
                  batch.push(mapped);
                }
                if (batch.length >= BATCH_SIZE) {
                  await Log.insertMany(batch);
                  logCount += batch.length;
                  console.log(
                    `Migrated ${logCount} logs from ${foundTable}...`,
                  );
                  batch = [];
                }
              }
            }
          }
        }
      }
      if (batch.length > 0) {
        await Log.insertMany(batch);
        logCount += batch.length;
        batch = [];
      }
    }
    console.log(`Migration finished. Total logs migrated: ${logCount}`);
    process.exit(0);
  } catch (error) {
    console.error("Migration fatal error:", error);
    process.exit(1);
  }
};

// Simple SQL Value extractor (assumes basic INSERT format)
function extractValues(line) {
  const match = line.match(/VALUES\s*(.*);/i);
  if (!match) return [];

  // Split by ),( but be careful with escaped characters
  // This is a simplified version for this specific dump
  const content = match[1];
  const rows = [];
  let current = "";
  let inString = false;
  let inParen = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === "'" && content[i - 1] !== "\\") inString = !inString;
    if (!inString) {
      if (char === "(") inParen = true;
      else if (char === ")") {
        inParen = false;
        rows.push(current.trim());
        current = "";
        continue;
      }
      if (char === "," && !inParen) continue;
    }
    if (inParen || inString) current += char;
  }
  return rows;
}

function mapToLog(valString, source) {
  // valString is something like: 123, 'mailer', 'template', ...
  // Need to split by comma but respect strings
  const parts = [];
  let current = "";
  let inString = false;
  for (let i = 0; i < valString.length; i++) {
    if (valString[i] === "'" && valString[i - 1] !== "\\") inString = !inString;
    if (valString[i] === "," && !inString) {
      parts.push(current.trim().replace(/^'|'$/g, ""));
      current = "";
    } else {
      current += valString[i];
    }
  }
  parts.push(current.trim().replace(/^'|'$/g, ""));

  if (
    source === "sending_log" ||
    source === "sending_stats" ||
    source === "stats"
  ) {
    // Table structure from svml.sql:
    // (sno, total_count, sucess_count, error_log, ip, offerid, error_count, mailer, logged_on, mode)
    return {
      mailer: parts[7] || "Legacy",
      template_id: "Legacy",
      interface: "Legacy",
      server: parts[4] || "Unknown",
      offer_id: parts[5] || "Legacy",
      domain: "Legacy",
      from: "Legacy",
      test_sent: parts[9] === "test" ? parseInt(parts[2]) : 0,
      bulk_test_sent: parts[9] === "Bulk Test" ? parseInt(parts[2]) : 0,
      bulk_test:
        parts[9] === "Bulk" || parts[9] === "bulk"
          ? parseInt(parts[2])
          : parseInt(parts[1]) || 0,
      error: parseInt(parts[6]) || 0,
      sent_on: parts[8] ? new Date(parts[8]) : new Date(),
    };
  } else if (source === "emailmaster") {
    // (emailmasterid, email, md5, filename, status, create_date, modify_date)
    // Let's create a proxy log entry for emailmaster data if we want to show "imported data"
    return {
      mailer: "Legacy Import",
      template_id: parts[3] || "Legacy", // filename
      interface: "Import",
      server: "Legacy",
      offer_id: "Legacy",
      domain: parts[1] ? parts[1].split("@")[1] : "Unknown",
      from: parts[1] || "Unknown",
      bulk_test: 1,
      sent_on: parts[5] ? new Date(parts[5]) : new Date(),
    };
  }
  return {};
}

runMigration();
