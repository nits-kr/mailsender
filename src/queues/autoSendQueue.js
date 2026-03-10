const { Queue } = require("bullmq");
const { connection } = require("./emailQueue");

const autoSendQueue = new Queue("auto-send-queue", { connection });

module.exports = { autoSendQueue };
