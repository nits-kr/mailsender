const mongoose = require("mongoose");
const IP = require("./src/models/IP");
const SmtpDetail = require("./src/models/SmtpDetail");
require("dotenv").config();

const checkSmtpData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("--- IPs ---");
    const ips = await IP.find({});
    console.log(JSON.stringify(ips, null, 2));

    console.log("\n--- SMTP DETAILS ---");
    const smtpDetails = await SmtpDetail.find({});
    console.log(JSON.stringify(smtpDetails, null, 2));

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkSmtpData();
