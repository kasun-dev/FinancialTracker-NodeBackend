const Transaction = require("../models/Transaction");
const moment = require("moment");

// Create a new transaction
exports.createTransaction = async (req, res) => {
    try {
        const { amount, type, category, tags, recurrence, date, notes } = req.body;

        if (!amount || !type || !category || !date) {
            return res.status(400).json({ message: "All required fields must be filled" });
        }

        const transaction = await Transaction.create({
            userId: req.user.id,
            amount,
            type,
            category,
            tags,
            recurrence,
            date,
            notes
        });

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all transactions for the logged-in user with filters (category, tags, date range)
exports.getFilteredTransactions = async (req, res) => {
    try {
        const { category, tags, startDate, endDate } = req.query;
        let filter = { userId: req.user.id };

        if (category) filter.category = category;
        if (tags) filter.tags = { $in: tags.split(",") };
        if (startDate && endDate) {
            filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const transactions = await Transaction.find(filter).sort({ date: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a specific transaction by ID
exports.getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        if (transaction.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a transaction
exports.updateTransaction = async (req, res) => {
    try {
        let transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        if (transaction.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const { amount, type, category, tags, recurrence, date, notes } = req.body;

        transaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            { amount, type, category, tags, recurrence, date, notes },
            { new: true }
        );

        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        if (transaction.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        await Transaction.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Transaction deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
