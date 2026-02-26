const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();
// require("./queues/emailWorker"); // Start background worker

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

// Express 5 handles async errors natively, so express-async-errors is not needed
// require("express-async-errors");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const logger = require("./utils/logger");

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(
  "/all_tar",
  (req, res, next) => {
    console.log(`[DOWNLOAD] Request for: ${req.url}`);
    next();
  },
  express.static(path.join(__dirname, "../all_tar")),
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
app.use("/api/imap-screens", require("./routes/imapScreenRoutes"));
app.use("/api/smtp", smtpRoutes);
app.use("/api/legacy", require("./routes/legacyRoutes"));
app.use("/t", trackingRoutes);

app.get("/", (req, res) => {
  res.send("ESP API is running...");
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
