const Imap = require("imap");
const { simpleParser } = require("mailparser");
const EmailAccount = require("../models/EmailAccount");
const fs = require("fs");
const path = require("path");

// Helper to fetch complains from a single IMAP host
const fetchFromHost = (config) => {
  return new Promise((resolve, reject) => {
    const imap = new Imap(config);
    const results = [];

    function openBox(cb) {
      if (config.mailbox) {
        imap.openBox(config.mailbox, false, cb);
      } else {
        imap.openBox("INBOX", false, cb);
      }
    }

    imap.once("ready", () => {
      openBox((err, box) => {
        if (err) return reject(err);

        // Search for emails from Yahoo FBL
        // The legacy code used: FROM "feedback@arf.mail.yahoo.com"
        imap.search([["FROM", "feedback@arf.mail.yahoo.com"]], (err, uids) => {
          if (err) return reject(err);

          if (!uids || uids.length === 0) {
            imap.end();
            return resolve([]);
          }

          const f = imap.fetch(uids, { bodies: "" });
          f.on("message", (msg, seqno) => {
            msg.on("body", (stream, info) => {
              simpleParser(stream, async (err, parsed) => {
                if (err) return;
                // Look for Original-Rcpt-To in headers or body
                // Yahoo FBL format usually has it in the second part of the multipart/report
                // For simplicity, we search the text/html content
                const body = parsed.text || parsed.html || "";
                const match = body.match(/Original-Rcpt-To:\s*(.+)/i);
                if (match && match[1]) {
                  results.push(match[1].trim());
                }
              });
            });
          });

          f.once("error", (err) => {
            reject(err);
          });

          f.once("end", () => {
            // Delete and expunge
            imap.addFlags(uids, "\\Deleted", (err) => {
              if (err) console.error("Error marking as deleted:", err);
              imap.expunge((err) => {
                if (err) console.error("Error expunging:", err);
                imap.end();
              });
            });
          });
        });
      });
    });

    imap.once("error", (err) => {
      reject(err);
    });

    imap.once("end", () => {
      resolve(results);
    });

    imap.connect();
  });
};

const getAccounts = async (req, res) => {
  try {
    const accounts = await EmailAccount.find({});
    res.json(accounts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching accounts", error: error.message });
  }
};

const addAccount = async (req, res) => {
  const { accountType, inboxImapHost, spamImapHost, email, password } =
    req.body;
  try {
    const newAccount = new EmailAccount({
      accountType,
      inboxImapHost,
      spamImapHost,
      email,
      password,
    });
    await newAccount.save();
    res.status(201).json(newAccount);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding account", error: error.message });
  }
};

const updateAccount = async (req, res) => {
  const { accountType, inboxImapHost, spamImapHost, email, password } =
    req.body;
  try {
    const updatedAccount = await EmailAccount.findByIdAndUpdate(
      req.params.id,
      { accountType, inboxImapHost, spamImapHost, email, password },
      { new: true },
    );
    res.json(updatedAccount);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating account", error: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    await EmailAccount.findByIdAndDelete(req.params.id);
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting account", error: error.message });
  }
};

const fetchComplains = async (req, res) => {
  const { email } = req.body;

  try {
    const account = await EmailAccount.findOne({ email });
    if (!account) {
      return res.status(404).json({ message: "Email account not found" });
    }

    const { inboxImapHost, spamImapHost, password } = account;

    // Parse host and port from format {host:port/imap/ssl}BOX
    const parseConfig = (hostStr) => {
      const match = hostStr.match(/\{(.+):(\d+)\/imap\/(ssl|tls|notls)\}(.+)/);
      if (match) {
        return {
          user: email,
          password: password,
          host: match[1],
          port: parseInt(match[2]),
          tls: match[3] !== "notls",
          mailbox: match[4],
          tlsOptions: { rejectUnauthorized: false },
        };
      }
      return null;
    };

    const inboxConfig = parseConfig(inboxImapHost);
    const spamConfig = parseConfig(spamImapHost);

    if (!inboxConfig || !spamConfig) {
      return res.status(400).json({ message: "Invalid IMAP host format" });
    }

    const inboxEmails = await fetchFromHost(inboxConfig);
    const spamEmails = await fetchFromHost(spamConfig);

    const allEmails = [...inboxEmails, ...spamEmails];
    const uniqueEmails = [...new Set(allEmails)];

    if (uniqueEmails.length > 0) {
      const date = new Date().toISOString().split("T")[0];
      const fileName = `${email}_${date}.txt`;
      const filePath = path.join(
        __dirname,
        "../../uploads/complains",
        fileName,
      );

      fs.appendFileSync(filePath, uniqueEmails.join("\n") + "\n");

      res.json({
        message: `Fetched ${uniqueEmails.length} complains.`,
        details: `File created: ${fileName} | Inbox: ${inboxEmails.length} | Spam: ${spamEmails.length}`,
      });
    } else {
      res.json({ message: "No new complains found." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching complains", error: error.message });
  }
};

const getFetchedFiles = async (req, res) => {
  const directoryPath = path.join(__dirname, "../../uploads/complains");
  try {
    if (!fs.existsSync(directoryPath)) {
      return res.json([]);
    }
    const files = fs.readdirSync(directoryPath);
    const fileList = files.map((file) => {
      const stats = fs.statSync(path.join(directoryPath, file));
      const parts = file.replace(".txt", "").split("_");
      return {
        name: parts[0] || file,
        date: parts[1] || stats.birthtime.toISOString().split("T")[0],
        fileName: file,
        url: `/uploads/complains/${file}`,
      };
    });
    res.json(fileList.reverse());
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching file list", error: error.message });
  }
};

module.exports = {
  getAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
  fetchComplains,
  getFetchedFiles,
};
