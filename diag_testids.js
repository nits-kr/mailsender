const mongoose = require("mongoose");
require("dotenv").config();
const TestId = require("./src/models/TestId");

async function checkTestIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const allCount = await TestId.countDocuments({});
    const activeCount = await TestId.countDocuments({ status: "A" });
    const deactiveCount = await TestId.countDocuments({ status: "D" });
    const otherStatuses = await TestId.distinct("status");

    console.log(`Total TestIDs: ${allCount}`);
    console.log(`Active (A): ${activeCount}`);
    console.log(`Deactive (D): ${deactiveCount}`);
    console.log(`Distinct statuses found: ${JSON.stringify(otherStatuses)}`);

    if (allCount > 0) {
      const sample = await TestId.findOne({});
      console.log("Sample record keys:", Object.keys(sample.toObject()));
      console.log("Sample status:", sample.status);
    }

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

checkTestIds();
