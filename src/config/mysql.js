const mysql = require("mysql2/promise");
require("dotenv").config();

const config = {
  host: "localhost",
  user: "root",
  password: "dvfersefag243435", // From legacy include.php
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(config);

module.exports = pool;
