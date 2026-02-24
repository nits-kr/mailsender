const mongoose = require("mongoose");
const Server = require("./src/models/Server");
const IP = require("./src/models/IP");
require("dotenv").config();

const listData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const servers = await Server.find({});
    const ips = await IP.find({});

    console.log("--- SERVERS ---");
    console.log(JSON.stringify(servers, null, 2));
    console.log("--- IPs ---");
    console.log(JSON.stringify(ips, null, 2));

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

listData();
