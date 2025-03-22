const express = require("express");
const {// Import the functions that we created in the controller
    createTransaction,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    getFilteredTransactions
} = require("../controllers/transactionController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new transaction
router.post("/", authMiddleware, createTransaction);

// Get all transactions for the logged-in user (with optional filters)
router.get("/", authMiddleware, getFilteredTransactions);

// Get a specific transaction by ID
router.get("/:id", authMiddleware, getTransactionById);

// Update a transaction
router.put("/:id", authMiddleware, updateTransaction);

// Delete a transaction
router.delete("/:id", authMiddleware, deleteTransaction);

module.exports = router;
