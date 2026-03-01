const { Queue } = require("bullmq");
const { connection } = require("./emailQueue");

const spaceEmailQueue = new Queue("space-email-queue", { connection });

module.exports = {
  spaceEmailQueue,
};
