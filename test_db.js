const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const testConnect = async () => {
  try {
    const rawUri = process.env.MONGODB_URI;
    const uri = rawUri.includes("?")
      ? rawUri.replace("?", "esp_platform?")
      : rawUri.endsWith("/")
        ? rawUri + "esp_platform"
        : rawUri + "/esp_platform";

    console.log(`Connecting to: ${uri.replace(/:([^@]+)@/, ":****@")}`);
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      "Collections in esp_platform:",
      collections.map((c) => c.name),
    );

    for (const coll of collections) {
      const count = await mongoose.connection.db
        .collection(coll.name)
        .countDocuments();
      console.log(`Collection [${coll.name}] count: ${count}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Connection/Query error:", error);
    process.exit(1);
  }
};

testConnect();
