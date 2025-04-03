const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://Aayush:aayush@test.0orf7.mongodb.net/?retryWrites=true&w=majority&appName=Test", { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("MongoDB Connected");
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
