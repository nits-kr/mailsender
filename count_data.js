const mongoose = require("mongoose");
const Server = require("./src/models/Server");
const IP = require("./src/models/IP");
const Log = require("./src/models/Log");
require("dotenv").config();

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const serverCount = await Server.countDocuments();
    const ipCount = await IP.countDocuments();
    const logCount = await Log.countDocuments();

    console.log(`Total Servers: ${serverCount}`);
    console.log(`Total IPs: ${ipCount}`);
    console.log(`Total Logs: ${logCount}`);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

test();
