const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const { Worker } = require("bullmq");
const { connection } = require("./queues/emailQueue");
const emailWorker = require("./queues/emailWorker");
const logger = require("./utils/logger");
const { startImapScannerJob } = require("./queues/imapQueue");

dotenv.config();

// Start BullMQ worker so /api/email/send queued jobs are actually processed.
const worker = new Worker("email-queue", emailWorker, { connection });
worker.on("completed", (job) => {
  logger.info(`Email job completed: ${job.id}`);
});
worker.on("failed", (job, err) => {
  logger.error(`Email job failed: ${job?.id || "unknown"} - ${err.message}`);
});

// Connect to database
connectDB();

const app = express();

const userRoutes = require("./routes/userRoutes");
const dataRoutes = require("./routes/dataRoutes");
const emailRoutes = require("./routes/emailRoutes");
const offerRoutes = require("./routes/offerRoutes");
const suppressionRoutes = require("./routes/suppressionRoutes");
const complainRoutes = require("./routes/complainRoutes");
const serverSetupRoutes = require("./routes/serverSetupRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const serverRoutes = require("./routes/serverRoutes");
const screenRoutes = require("./routes/screenRoutes");
const linkRoutes = require("./routes/linkRoutes");
const imageRoutes = require("./routes/imageRoutes");
const testIdsRoutes = require("./routes/testIdsRoutes");
const smtpRoutes = require("./routes/smtpRoutes");
const trackingRoutes = require("./routes/trackingRoutes");
const intelligenceRoutes = require("./routes/intelligenceRoutes");

// Express 5 handles async errors natively, so express-async-errors is not needed
// require("express-async-errors");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// Legacy image portal upload path mapping for remote server parity
app.use(
  "/image_portal/uploads",
  express.static(path.join(__dirname, "../uploads/images")),
);
app.use(
  "/uploads/temp",
  express.static(path.join(__dirname, "../uploads/temp")),
);

// Dynamic Image Pattern Interceptor
// This allows users to invent any URL structure (e.g. /images/deals/promo-filename.jpg)
// As long as it ends in an image extension, we serve it from /uploads/images/
app.get("*", (req, res, next) => {
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(req.path);
  if (isImage) {
    const filename = path.basename(req.path);
    const imagePath = path.join(__dirname, "../uploads/images", filename);
    const fs = require("fs");

    // Only serve if it actually exists in our local uploads folder
    if (fs.existsSync(imagePath)) {
      return res.sendFile(imagePath);
    }
  }
  next();
});
app.use(
  "/all_tar",
  (req, res, next) => {
    console.log(`[DOWNLOAD] Request for: ${req.url}`);
    next();
  },
  express.static(path.join(__dirname, "../all_tar")),
);

// Serve module documentation folders
app.use(
  "/ESP_Module_fsock_send_smtp_auto",
  express.static(path.join(__dirname, "../ESP_Module_fsock_send_smtp_auto")),
);
app.use(
  "/ESP_Module_fsock_send_smtp",
  express.static(path.join(__dirname, "../ESP_Module_fsock_send_smtp")),
);
app.use(
  "/ESP_Module_fsock",
  express.static(path.join(__dirname, "../ESP_Module_fsock")),
);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/suppression", suppressionRoutes);
app.use("/api/complain", complainRoutes);
app.use("/api/server-setup", serverSetupRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/servers-management", serverRoutes);
app.use("/api/screens", screenRoutes);
app.use("/api/links", linkRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/testids", testIdsRoutes);
app.use("/api/mailbox", require("./routes/mailboxRoutes"));
app.use("/api/imap-screens", require("./routes/imapScreenRoutes"));
app.use("/api/smtp", smtpRoutes);
app.use("/api/legacy", require("./routes/legacyRoutes"));
app.use("/api/intelligence", intelligenceRoutes);
app.use("/t", trackingRoutes);

app.get("/", (req, res) => {
  res.send("ESP API is running...");
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  // Start the background IMAP scanner job
  await startImapScannerJob();

  // Start the Inbox Intelligence Engine Monitor
  const inboxMonitor = require("./services/intelligence/InboxMonitor");
  inboxMonitor.start();
});
