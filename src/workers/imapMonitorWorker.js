/**
 * imapMonitorWorker.js
 *
 * Usage: node src/workers/imapMonitorWorker.js <testId_sno> <INBOX|SPAM>
 */

const mongoose = require("mongoose");
const Imap = require("node-imap");
const { simpleParser } = require("mailparser");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const TestId = require("../models/TestId");
const ImapData = require("../models/ImapData");

dotenv.config();

const sno = process.argv[2];
const scanType = process.argv[3] || "INBOX";

if (!sno) {
  console.error("Missing TestId sno argument.");
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mailsender", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => startMonitoring())
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

async function startMonitoring() {
  try {
    const testIdDoc = await TestId.findOne({ sno: sno });
    if (!testIdDoc) {
      console.error(`TestId with sno ${sno} not found.`);
      process.exit(1);
    }

    const email = testIdDoc.email;
    const logPath = path.resolve(
      __dirname,
      "../../advance_imap",
      `${email}.txt`,
    );
    const d = () =>
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const log = (msg) => {
      console.log(`[${scanType}] ${msg}`);
      fs.appendFileSync(logPath, `${msg} ${d()}\n`);
    };

    const imap = new Imap({
      user: testIdDoc.email,
      password: testIdDoc.password,
      host:
        scanType === "INBOX" ? testIdDoc.inboxhostname : testIdDoc.spamhostname,
      port: parseInt(testIdDoc.port) || 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    });

    const openFolder = (cb) => {
      const folder = scanType === "INBOX" ? "INBOX" : "SPAM";
      // Try to find the exact folder name (Case sensitive in some IMAP servers)
      imap.getBoxes((err, boxes) => {
        if (err) return cb(err);

        // Simple heuristic for Spam folder names if not exactly "SPAM"
        let targetFolder = folder;
        if (folder === "SPAM") {
          const possibleNames = ["SPAM", "Junk", "Junk E-mail", "[Gmail]/Spam"];
          for (const name of possibleNames) {
            if (
              boxes[name] ||
              (boxes["[Gmail]"] && boxes["[Gmail]"].children[name])
            ) {
              targetFolder = name;
              break;
            }
          }
        }

        imap.openBox(targetFolder, false, cb);
      });
    };

    imap.once("ready", () => {
      log(`IMAP CONNECTION ESTABLISHED FOR ${email} ${scanType}`);

      const scanLoop = () => {
        openFolder(async (err, box) => {
          if (err) {
            log(`ERROR OPENING ${scanType}: ${err.message}`);
            return setTimeout(scanLoop, 10000);
          }

          log(`CONNECTION ACTIVE ${scanType}`);

          try {
            // Find last seen UID for this account and status
            const lastEntry = await ImapData.findOne({
              email: email,
              status: scanType,
            }).sort({ uid: -1 });
            const lastUid = lastEntry ? lastEntry.uid : 0;

            // Search for all messages with UID > lastUid
            imap.search([["UID", `${lastUid + 1}:*`]], (err, results) => {
              if (err) {
                log(`SEARCH ERROR: ${err.message}`);
                return setTimeout(scanLoop, 5000);
              }

              if (!results || results.length === 0) {
                log(`NO NEW MAILS`);
                log(
                  `_________________________________________________________________________________`,
                );
                return setTimeout(scanLoop, 5000);
              }

              // Filter out the lastUid if it was returned in the range
              const newUids = results.filter((u) => u > lastUid);
              if (newUids.length === 0) {
                log(`NO NEW MAILS`);
                return setTimeout(scanLoop, 5000);
              }

              log(`FOUND ${newUids.length} NEW MAILS`);

              const fetch = imap.fetch(newUids, {
                bodies: ["HEADER", "TEXT"],
                struct: true,
              });

              let processedCount = 0;

              fetch.on("message", (msg, seqno) => {
                let attributes;
                msg.on("attributes", (attrs) => {
                  attributes = attrs;
                });

                msg.on("body", (stream, info) => {
                  simpleParser(stream, async (err, parsed) => {
                    if (err) return;

                    // Extract IP from Received headers (similar to PHP logic)
                    let senderIp = "0.0.0.0";
                    const receivedHeaders = parsed.headers.get("received");
                    if (receivedHeaders) {
                      const headersArray = Array.isArray(receivedHeaders)
                        ? receivedHeaders
                        : [receivedHeaders];
                      for (const header of headersArray) {
                        const ipMatch = header.match(
                          /\[(\d+\.\d+\.\d+\.\d+)\]/,
                        );
                        if (ipMatch) {
                          senderIp = ipMatch[1];
                          break;
                        }
                      }
                    }

                    try {
                      await ImapData.create({
                        testId: testIdDoc._id,
                        email: email,
                        subject: parsed.subject,
                        from: parsed.from?.text,
                        to: parsed.to?.text,
                        date: parsed.date,
                        message_id: parsed.messageId,
                        uid: attributes?.uid || 0,
                        ip: senderIp,
                        status: scanType,
                      });
                    } catch (dbErr) {
                      // ignore duplicate uid or other errors
                    }

                    processedCount++;
                    if (processedCount === newUids.length) {
                      log(`COUNT : ${newUids.length} STORED ${scanType}`);
                      log(
                        `_________________________________________________________________________________`,
                      );
                      setTimeout(scanLoop, 5000);
                    }
                  });
                });
              });

              fetch.once("error", (err) => {
                log(`FETCH ERROR: ${err.message}`);
                setTimeout(scanLoop, 5000);
              });
            });
          } catch (e) {
            log(`LOOP ERROR: ${e.message}`);
            setTimeout(scanLoop, 5000);
          }
        });
      };

      scanLoop();
    });

    imap.once("error", (err) => {
      log(`IMAP ERROR: ${err.message}`);
      // Restart the script on fatal error
      process.exit(1);
    });

    imap.once("end", () => {
      log(`IMAP CONNECTION ENDED`);
      process.exit(0);
    });

    imap.connect();
  } catch (err) {
    console.error("Worker fatal error:", err);
    process.exit(1);
  }
}
