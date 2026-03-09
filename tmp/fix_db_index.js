const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const dropIndex = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    const collections = ["campaigntemplates", "campaigns"];
    const indexName = "mysql_sno_1";

    for (const colName of collections) {
      try {
        const collection = mongoose.connection.db.collection(colName);
        console.log(`Checking collection: ${colName}`);

        const indexes = await collection.indexes();
        const hasIndex = indexes.some((idx) => idx.name === indexName);

        if (hasIndex) {
          console.log(`Dropping index ${indexName} from ${colName}...`);
          await collection.dropIndex(indexName);
          console.log("Dropped successfully.");
        } else {
          console.log(`Index ${indexName} not found in ${colName}.`);
        }
      } catch (err) {
        console.error(`Error processing ${colName}: ${err.message}`);
      }
    }

    console.log(
      '\nAll done. Mongoose will recreate the indexes with "sparse: true" on the next app restart.',
    );
    process.exit(0);
  } catch (err) {
    console.error("Fatal error:", err.message);
    process.exit(1);
  }
};

dropIndex();
