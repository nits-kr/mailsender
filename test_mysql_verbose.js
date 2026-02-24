const mysql = require("mysql2/promise");
require("dotenv").config();

const config = {
  host: "localhost",
  user: "root",
  password: "dvfersefag243435",
};

const test = async () => {
  try {
    console.log("Attempting to connect to MySQL...");
    const connection = await mysql.createConnection(config);
    console.log("Connected to MySQL!");

    const [rows] = await connection.query("SHOW DATABASES");
    console.log(
      "Databases:",
      rows.map((r) => r.Database),
    );

    await connection.end();
  } catch (error) {
    console.error("MySQL Connection Error Details:");
    console.error("Code:", error.code);
    console.error("Errno:", error.errno);
    console.error("SqlState:", error.sqlState);
    console.error("SqlMessage:", error.sqlMessage);
    console.error("Full Error:", error);
  }
};

test();
