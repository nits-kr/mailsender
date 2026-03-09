const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const IP = require("../src/models/IP");
const SmtpDetail = require("../src/models/SmtpDetail");
const Server = require("../src/models/Server");

const diagnose = async () => {
  const uri = process.env.MONGODB_URI;
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    const ipKey = "AliSing07";
    console.log(`Diagnosing ipKey: "${ipKey}"`);

    // 1. Check IP collection
    const ipByIp = await IP.findOne({ ip: ipKey });
    const ipByRegex = await IP.findOne({ ip: new RegExp(`^${ipKey}$`, "i") });
    console.log("IP Collection:", { ipByIp, ipByRegex });

    // 2. Check SmtpDetail collection
    const smtpByAssigned = await SmtpDetail.findOne({ assignedip: ipKey });
    const smtpByServer = await SmtpDetail.findOne({ server: ipKey });
    const smtpByRegexAssigned = await SmtpDetail.findOne({
      assignedip: new RegExp(`^${ipKey}$`, "i"),
    });
    const smtpByRegexServer = await SmtpDetail.findOne({
      server: new RegExp(`^${ipKey}$`, "i"),
    });
    console.log("SmtpDetail Collection:", {
      smtpByAssigned,
      smtpByServer,
      smtpByRegexAssigned,
      smtpByRegexServer,
    });

    // 3. Check Server collection
    const serverByName = await Server.findOne({ name: ipKey });
    const serverByRegex = await Server.findOne({
      name: new RegExp(`^${ipKey}$`, "i"),
    });
    console.log("Server Collection:", { serverByName, serverByRegex });

    if (serverByName) {
      // Find IPs belonging to this server
      const ips = await IP.find({ server: serverByName._id });
      console.log(`IPs belonging to server ${ipKey}:`, ips);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

diagnose();
