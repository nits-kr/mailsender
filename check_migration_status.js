const mongoose = require("mongoose");
const CampaignTemplate = require("./src/models/CampaignTemplate");
const IP = require("./src/models/IP");
const User = require("./src/models/User");
require("dotenv").config();

const checkCounts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const campaignCount = await CampaignTemplate.countDocuments();
    const ipCount = await IP.countDocuments();
    const userCount = await User.countDocuments();

    console.log("Migration Counts in esp_platform:");
    console.log("- Campaign Templates:", campaignCount);
    console.log("- IPs:", ipCount);
    console.log("- Users:", userCount);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkCounts();
