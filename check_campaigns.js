const mongoose = require("mongoose");
const Campaign = require("./src/models/Campaign");
require("dotenv").config();

const checkCampaigns = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("--- CAMPAIGNS ---");
    const campaigns = await Campaign.find({});
    console.log(JSON.stringify(campaigns, null, 2));

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkCampaigns();
