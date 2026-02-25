const mysql = require("mysql2/promise");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const EmailMaster = require("./src/models/EmailMaster");

dotenv.config();

const migrateEmailMaster = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const conn = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: "all_data",
    });
    console.log("Connected to MySQL (all_data)");

    const [countRows] = await conn.execute(
      "SELECT COUNT(*) as total FROM emailmaster",
    );
    const total = countRows[0].total;
    console.log(`Total records to migrate: ${total}`);

    const batchSize = 10000;
    for (let i = 0; i < total; i += batchSize) {
      const [rows] = await conn.execute(
        `SELECT email, md5, domain FROM emailmaster LIMIT ${i}, ${batchSize}`,
      );

      const operations = rows.map((r) => ({
        updateOne: {
          filter: { email: r.email.toLowerCase() },
          update: {
            email: r.email.toLowerCase(),
            md5: r.md5,
            domain: r.domain,
          },
          upsert: true,
        },
      }));

      if (operations.length > 0) {
        await EmailMaster.bulkWrite(operations);
        console.log(`Migrated ${i + rows.length} / ${total}`);
      }
    }

    console.log("EmailMaster migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateEmailMaster();
