const { Queue } = require("bullmq");
const redisOptions = require("../config/redis");

const spaceEmailQueue = new Queue("space-email-queue", {
  connection: redisOptions,
});

module.exports = {
  spaceEmailQueue,
};
