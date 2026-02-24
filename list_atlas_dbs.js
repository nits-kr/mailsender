const mongoose = require("mongoose");
require("dotenv").config();

const listDBs = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    const admin = mongoose.connection.db.admin();
    const result = await admin.listDatabases();
    console.log("DATABASE_LIST_START");
    result.databases.forEach((db) => {
      console.log(`DB: ${db.name} | Size: ${db.sizeOnDisk}`);
    });
    console.log("DATABASE_LIST_END");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

listDBs();
