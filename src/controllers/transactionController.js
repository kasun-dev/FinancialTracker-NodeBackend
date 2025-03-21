const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Notification = require("../models/Notification");
const moment = require("moment");

// Create a new transaction
exports.createTransaction = async (req, res) => {
    try {
        const { amount, type, category, tags, recurrence, date, notes } = req.body;

        if (!amount || !type || !category || !date) {
            return res.status(400).json({ message: "All required fields must be filled" });
        }

        // Convert date to a JavaScript Date object
        const transactionDate = new Date(date);
        const month = transactionDate.getMonth() + 1; // JavaScript months are 0-based
        const year = transactionDate.getFullYear();

        if (type === "expense") {
            // Find the budget for the given category and month
            const budget = await Budget.findOne({ userId: req.user.id, category, month, year });

            if (budget) {
                // Calculate total spent for the category in the current month
                const totalSpent = await Transaction.aggregate([
                    {
                        $match: {
                            userId: req.user.id,
                            category: category,
                            type: "expense",
                            date: {
                                $gte: new Date(`${year}-${month}-01`),
                                $lt: new Date(`${year}-${month + 1}-01`)
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$amount" }
                        }
                    }
                ]);

                const spentAmount = totalSpent.length > 0 ? totalSpent[0].total : 0;
                const newTotalSpent = spentAmount + amount;

                // If the new transaction exceeds the budget limit, create a notification
                if (newTotalSpent > budget.limit) {
                    await Notification.create({
                        userId: req.user.id,
                        message: `Your budget for ${category} has been exceeded. Limit: ${budget.limit}, Spent: ${newTotalSpent}`,
                        type: "budget_exceeded"
                    });
                }
            }
        }

        // Create the transaction
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
