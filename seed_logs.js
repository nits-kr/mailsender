const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Log = require("./src/models/Log");

dotenv.config();

const seedLogs = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    console.log(`Connecting to: ${uri.replace(/:([^@]+)@/, ":****@")}`);
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    // Clear existing logs for testing
    await Log.deleteMany({});

    const mockLogs = [
      {
        mailer: "Kishan",
        template_id: "848033",
        interface: "FSOCK SEND SMTP AUTO",
        server: "smtp006",
        offer_id: "1",
        domain: "getyourfitproduct.com",
        from: "newsletters@getyourfitproduct.com",
        bulk_test: 3000,
        bulk_test_sent: 16,
      },
      {
        mailer: "Ankit",
        template_id: "848984",
        interface: "FSOCK SEND SMTP AUTO",
        server: "smtp007",
        offer_id: "1",
        domain: "home_renovationpro.com",
        from: "People@homerestoreplan.com",
        bulk_test: 2000,
        bulk_test_sent: 4,
      },
      {
        mailer: "Purvi",
        template_id: "847811",
        interface: "FSOCK SEND SMTP AUTO",
        server: "smtp008",
        offer_id: "1",
        domain: "boostyourfinanceplan.com",
        from: "newsletters@boostyourfinanceplan.com",
        bulk_test: 1240,
        bulk_test_sent: 8,
      },
      {
        mailer: "Amrakant",
        template_id: "848275",
        interface: "FSOCK SEND SMTP AUTO",
        server: "smtp009",
        offer_id: "1",
        domain: "home_renovationpro.com",
        from: "People@homerestoreplan.com",
        bulk_test: 2000,
        bulk_test_sent: 20,
      },
    ];

    await Log.insertMany(mockLogs);
    console.log("Mock logs seeded successfully!");

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedLogs();
