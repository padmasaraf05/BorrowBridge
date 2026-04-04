const mongoose = require("mongoose");

// Hardcoded to bypass global dotenv injector issue
const MONGO_URI = "mongodb+srv://padmasaraf05_db_user:borrowbridge123@cluster0.rxlbiki.mongodb.net/borrowbridge?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;