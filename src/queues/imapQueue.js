const { Queue, Worker } = require("bullmq");
const ioredis = require("ioredis");
const { runScanner } = require("../services/imapScanner");

const connection = new ioredis(
  process.env.REDIS_URI || "redis://127.0.0.1:6379",
  {
    maxRetriesPerRequest: null,
  },
);

const imapQueue = new Queue("imap-scanner-queue", { connection });

// Imap Worker - runs every 15 seconds to scan TestIDs
const imapWorker = new Worker(
  "imap-scanner-queue",
  async (job) => {
    console.log("IMAP Scanner job started...");
    await runScanner();
    console.log("IMAP Scanner job completed.");
  },
  { connection },
);

// Helper to schedule the periodic job
const startImapScannerJob = async () => {
  // Add a repeatable job that runs every 15 seconds for near-real-time detection
  await imapQueue.add(
    "scan-testids",
    {},
    {
      repeat: {
        every: 10000,
      },
      removeOnComplete: true,
      removeOnFail: true,
    },
  );
  console.log("IMAP Scanner periodic job scheduled (every 15s)");
};

module.exports = { imapQueue, startImapScannerJob };
