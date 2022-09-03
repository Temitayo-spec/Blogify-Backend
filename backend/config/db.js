const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://Temitayo:temi1234@blogify.rxjuodz.mongodb.net/?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("MongoDB Connected".green.bold);
  } catch (err) {
    console.log(err.message.red.bold);
    process.exit(1);
  }
};

module.exports = connectDB;
