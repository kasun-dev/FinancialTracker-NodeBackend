const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();
// Connect to the database
connectDB();

const app = express(); // Create an Express application
app.use(express.json()); // Enable parsing JSON bodies
app.use(cors()); // Enable CORS


// Define routes
app.use("/api/users", require("./routes/userRoutes")); //user
app.use("/api/transactions", require("./routes/transactionRoutes")); //transaction
app.use("/api/budgets", require("./routes/budgetRoutes")); //budget
app.use("/api/reports", require("./routes/reportRoutes")); //report
app.use("/api/notify", require("./routes/notificationRoutes")); //notification
app.use("/api/goals", require("./routes/goalRoutes")); //goal

// Export the Express application
module.exports = app;


