const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("❌ MONGO_URI is not set in environment variables");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, {
      autoIndex: true,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}

// 👉 Export the function directly
module.exports = connectDB;
