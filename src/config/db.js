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

    // Connection options for better stability with Atlas/Remote clusters
    const options = {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      connectTimeoutMS: 30000, // 30 seconds
    };

    const conn = await mongoose.connect(uri, options);

    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);

    // Add listeners for connection state changes
    mongoose.connection.on("error", (err) => {
      console.error(`MongoDB Runtime Error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("connected", () => {
      console.log("MongoDB connection established.");
    });
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;
