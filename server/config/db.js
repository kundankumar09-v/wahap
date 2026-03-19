const mongoose = require("mongoose");
const seedDB = require("./seed");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/wahap");
    console.log("MongoDB Connected");
    await seedDB();
  } catch (error) {
    console.error("DB connection failed");
    process.exit(1);
  }
};

module.exports = connectDB;