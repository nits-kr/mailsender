const mysql = require("mysql2/promise");

const config = {
  host: "173.249.50.153",
  user: "root",
  password: "dvfersefag243435",
};

async function test() {
  console.log("TEST_START");
  try {
    const conn = await mysql.createConnection(config);
    console.log("TEST_CONNECTED");
    const [rows] = await conn.query("SELECT 1 as result");
    console.log("TEST_QUERY_RESULT:", rows[0].result);
    await conn.end();
  } catch (err) {
    console.log("TEST_ERROR:", err.message);
    console.log("TEST_ERROR_CODE:", err.code);
  }
  console.log("TEST_END");
}

test();
