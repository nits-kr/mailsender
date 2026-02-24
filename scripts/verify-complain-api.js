const axios = require("axios");

const API_BASE = "http://localhost:5000/api/complain";

async function testApi() {
  console.log("Testing Complain Fetcher API...");

  try {
    // 1. Test Get Accounts
    console.log("\n1. Testing GET /accounts...");
    const accountsRes = await axios.get(`${API_BASE}/accounts`);
    console.log("Success! Accounts found:", accountsRes.data.length);

    // 2. Test Get Files
    console.log("\n2. Testing GET /files...");
    const filesRes = await axios.get(`${API_BASE}/files`);
    console.log("Success! Files found:", filesRes.data.length);
    if (filesRes.data.length > 0) {
      console.log("Latest file:", filesRes.data[0]);
    }

    console.log("\nAPI test completed successfully!");
  } catch (error) {
    console.error("\nAPI test failed!");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

testApi();
