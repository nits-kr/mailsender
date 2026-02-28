const cron = require("node-cron");
const MonitoringMailbox = require("../../models/MonitoringMailbox");
const imap = require("node-imap");
const { simpleParser } = require("mailparser");

class InboxMonitor {
  constructor() {
    this.isMonitoring = false;
  }

  start() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    // Schedule the check every 5 minutes (reduced frequency for stability)
    cron.schedule("*/5 * * * *", async () => {
      console.log("[Intelligence] Starting Inbox Sweep...");
      await this.performSweep();
    });

    console.log("Inbox Monitor Service Started (IMAP Scanner Active)");
  }

  async performSweep() {
    try {
      const mailboxes = await MonitoringMailbox.find({ isActive: true });
      for (const mbox of mailboxes) {
        await this.scanMailbox(mbox);
      }
    } catch (error) {
      console.error("Inbox Monitor Sweep Error:", error);
    }
  }

  async scanMailbox(mbox) {
    return new Promise((resolve) => {
      const client = new imap({
        user: mbox.email,
        password: mbox.password,
        host: mbox.host,
        port: mbox.port,
        tls: mbox.tls,
        tlsOptions: { rejectUnauthorized: false },
      });

      client.once("ready", () => {
        client.openBox("INBOX", false, () => {
          // Search for unseen messages from today or with specific headers
          client.search(["UNSEEN"], async (err, results) => {
            if (err || !results || results.length === 0) {
              client.end();
              return resolve();
            }

            const fetch = client.fetch(results, { bodies: "" });
            fetch.on("message", (msg) => {
              msg.on("body", async (stream) => {
                const parsed = await simpleParser(stream);
                const xCampaign = parsed.headers.get("x-campaign-fingerprint");

                if (xCampaign) {
                  await this.logResult({
                    campaignId: xCampaign.split(":")[0], // Extract campaign ID
                    provider: mbox.provider,
                    location: "inbox",
                    testEmail: mbox.email,
                    subject: parsed.subject,
                  });
                }
              });
            });

            fetch.once("end", () => {
              client.end();
              resolve();
            });
          });
        });
      });

      client.once("error", (err) => {
        console.error(`IMAP Error [${mbox.email}]:`, err.message);
        resolve();
      });

      client.connect();
    });
  }

  async logResult(data) {
    try {
      const IntelligenceLog = require("../../models/IntelligenceLog");
      const exists = await IntelligenceLog.findOne({
        campaignId: data.campaignId,
        testEmail: data.testEmail,
      });
      if (exists) return;

      const log = new IntelligenceLog(data);
      await log.save();

      console.log(
        `[Intelligence] Result Logged: ${data.provider} -> ${data.location}`,
      );

      // Update Reputation Score for assets associated with this campaign
      const Campaign = require("../../models/Campaign");
      const campaign = await Campaign.findById(data.campaignId);
      if (campaign) {
        // Update IP Score
        await this.updateScore("ip", campaign.server, data.location);
        // Update Domain Score
        await this.updateScore("domain", campaign.domain, data.location);
      }
    } catch (error) {
      console.error("Error logging intelligence result:", error);
    }
  }

  async updateScore(type, value, location) {
    if (!value || value === "Unknown") return;
    const ReputationScore = require("../../models/ReputationScore");

    let rep = await ReputationScore.findOne({
      assetType: type,
      assetValue: value,
    });
    if (!rep) {
      rep = new ReputationScore({ assetType: type, assetValue: value });
    }

    if (location === "inbox") {
      rep.inboxCount += 1;
    } else if (location === "spam") {
      rep.spamCount += 1;
    }

    const total = rep.inboxCount + rep.spamCount;
    if (total > 0) {
      rep.inboxScore = (rep.inboxCount / total) * 100;

      // Auto-Decision: Pause if below 50% after at least 5 tests
      if (total >= 5 && rep.inboxScore < 50) {
        rep.status = "paused";
      } else if (total >= 3 && rep.inboxScore < 75) {
        rep.status = "risky";
      } else {
        rep.status = "healthy";
      }
    }

    rep.lastChecked = new Date();
    await rep.save();
  }
}

module.exports = new InboxMonitor();
