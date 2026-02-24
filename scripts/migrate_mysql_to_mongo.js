const mysql = require("mysql2/promise");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../src/models/User");

dotenv.config();

const migrateData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Connect to MySQL
    // Note: Using credentials from include.php
    const mysqlConnection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "dvfersefag243435",
      database: "login",
    });
    console.log("Connected to MySQL");

    // Fetch users from MySQL
    const [rows] = await mysqlConnection.execute("SELECT * FROM users");
    console.log(`Found ${rows.length} users in MySQL`);

    for (const row of rows) {
      const userExists = await User.findOne({ email: row.email });
      if (!userExists) {
        await User.create({
          id: row.id,
          name: row.name,
          email: row.email,
          password: row.password, // Existing passwords are base64 encoded
          designation: row.designation,
          status: row.status,
        });
        console.log(`Migrated user: ${row.email}`);
      } else {
        console.log(`User already exists: ${row.email}`);
      }
    }

    console.log("Migration completed successfully");
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

migrateData();
