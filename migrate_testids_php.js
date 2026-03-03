/**
 * migrate_testids_php.js
 * One‑shot migration: strip trailing `.php` from filenameinbox / filenamespam
 * in every TestId document that still has these legacy PHP extensions.
 *
 * Run once:  node migrate_testids_php.js
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const TestId = require("./src/models/TestId");

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  const docs = await TestId.find({
    $or: [{ filenameinbox: /\.php$/i }, { filenamespam: /\.php$/i }],
  });

  console.log(`Found ${docs.length} document(s) with .php filenames.`);

  let updated = 0;
  for (const doc of docs) {
    const newInbox = (doc.filenameinbox || "").replace(/\.php$/i, "");
    const newSpam = (doc.filenamespam || "").replace(/\.php$/i, "");

    await TestId.findByIdAndUpdate(doc._id, {
      filenameinbox: newInbox,
      filenamespam: newSpam,
    });

    console.log(
      `  ✔ ${doc.email}: "${doc.filenameinbox}" → "${newInbox}" | "${doc.filenamespam}" → "${newSpam}"`,
    );
    updated++;
  }

  console.log(`\nMigration complete. ${updated} document(s) updated.`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
