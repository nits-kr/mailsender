const mongoose = require("mongoose");
const { migrateLegacyData } = require("./src/utils/migration");
require("dotenv").config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    await migrateLegacyData();

    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration crashed:", error);
    process.exit(1);
  }
};

run();
