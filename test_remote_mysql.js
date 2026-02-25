const mysql = require("mysql2/promise");

const testRemote = async () => {
  const config = {
    host: "173.249.50.153",
    user: "root",
    password: "dvfersefag243435",
    connectTimeout: 5000,
  };

  try {
    console.log(`Connecting to remote: ${config.host}...`);
    const connection = await mysql.createConnection(config);
    console.log("Connected to remote MySQL!");
    await connection.end();
  } catch (error) {
    console.error("Remote Connection Error:");
    console.error("Code:", error.code);
    console.error("Errno:", error.errno);
    console.error("Message:", error.message);
  }
};

testRemote();
