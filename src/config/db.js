const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error(
        "DEBUG: MONGODB_URI is not defined in environment variables!",
      );
      return;
    }

    const maskedUri = uri.replace(/:([^@]+)@/, ":****@");
    console.log(`DEBUG: Connecting to MongoDB with URI: ${maskedUri}`);

    const conn = await mongoose.connect(uri);

    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Do not exit process here to allow the server to start (for diagnostic purposes or if other features don't need DB)
    // Actually, usually we exit, but let's just log for now as requested.
  }
};

module.exports = connectDB;
