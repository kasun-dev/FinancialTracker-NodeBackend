const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

const connectDB = async () => {
    try {
        // Select the appropriate database URI
        const mongoURI = process.env.NODE_ENV === "test" ? process.env.MONGO_URI_TEST : process.env.MONGO_URI;

        // Connect to MongoDB
        const conn = await mongoose.connect(mongoURI);

        // Display the connected database name
        console.log(`MongoDB Connected: ${conn.connection.name}`);
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
