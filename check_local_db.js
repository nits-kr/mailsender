const mongoose = require("mongoose");

const testLocal = async () => {
  try {
    const localUri = "mongodb://localhost:27017/esp_platform";
    console.log(`Connecting to local: ${localUri}`);
    await mongoose.connect(localUri);
    console.log("Connected to local MongoDB");

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      "Collections:",
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
    console.error("Local connection error:", error.message);
    process.exit(1);
  }
};

testLocal();
