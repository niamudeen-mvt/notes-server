const mongoose = require("mongoose");

const URI = process.env.MONGODB_URI;

const connectDb = async () => {
  try {
    await mongoose.connect(URI);
    console.log("connection to DB".bgMagenta);
  } catch (error) {
    console.log("database connection failed".bgMagenta);
    process.exit(0);
  }
};

module.exports = connectDb;
