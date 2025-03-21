const axios = require("axios");
const Transaction = require("../models/Transactions");
const Budget = require("../models/Budget");
const Goal = require("../models/Goals");
const Notification = require("../models/Notifications");

const EXCHANGE_API_KEY = "0cc4d9306aad0d84f58567a3"; // Your API Key
const EXCHANGE_API_URL = `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/`;

// Create a new transaction
exports.createTransaction = async (req, res) => {
    try {
        const { amount, type, category, currency, tags, recurrence, date, notes } = req.body;

        if (!amount || !type || !category || !date ) {
            return res.status(400).json({ message: "All required fields must be filled" });
        }

        // Convert date to JavaScript Date object
        const transactionDate = new Date(date);
        const month = transactionDate.getMonth() + 1; // JavaScript months are 0-based
        const year = transactionDate.getFullYear();

        let convertedAmount = amount;
        const userCurrency = currency.toUpperCase();

        // Convert to LKR if needed
        if (userCurrency !== "LKR") {
            const exchangeResponse = await axios.get(`${EXCHANGE_API_URL}${userCurrency}`);
            const exchangeRate = exchangeResponse.data.conversion_rates.LKR;

            if (!exchangeRate) {
                return res.status(400).json({ message: "Invalid currency or exchange rate not available." });
            }

            convertedAmount = amount * exchangeRate; // Convert to LKR
        }

        // Check if expense exceeds the budget
        if (type === "expense") {
            const budget = await Budget.findOne({ userId: req.user.id, category, month, year });

            if (budget) {
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
                    { $group: { _id: null, total: { $sum: "$amount" } } }
                ]);

                const spentAmount = totalSpent.length > 0 ? totalSpent[0].total : 0;
                const newTotalSpent = spentAmount + convertedAmount;

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
            amount: convertedAmount, // Store in LKR
            type,
            category,
            currency: userCurrency, // Store original currency
            tags,
            recurrence,
            date,
            notes
        });

        // If it's an income transaction, auto-allocate funds to goals
        if (type === "income") {
            const goals = await Goal.find({ userId: req.user.id, autoAllocate: true });

            if (goals.length > 0) {
                let totalAllocated = 0;

                for (const goal of goals) {
                    const remainingGoalAmount = goal.targetAmount - (goal.currentSavings || 0);
                    const allocationAmount = Math.min(convertedAmount * 0.10, remainingGoalAmount); // 10% allocation

                    if (allocationAmount > 0) {
                        totalAllocated += allocationAmount;

                        // Create an expense transaction for the allocated amount
                        await Transaction.create({
                            userId: req.user.id,
                            amount: allocationAmount,
                            type: "expense",
                            category: `Goal: ${goal.goalName}`,
                            date,
                            notes: "Auto-allocated to savings goal"
                        });

                        // Update goal progress
                        await Goal.findByIdAndUpdate(goal._id, { $inc: { currentSavings: allocationAmount } });

                        // Create a notification for the user
                        await Notification.create({
                            userId: req.user.id,
                            message: `An amount of ${allocationAmount} has been auto-allocated to your goal: ${goal.goalName}`,
                            type: "goal_allocation"
                        });
                    }
                }

                if (totalAllocated > 0) {
                    await Notification.create({
                        userId: req.user.id,
                        message: `Total of ${totalAllocated} auto-allocated to financial goals from your income.`,
                        type: "goal_allocation_summary"
                    });
                }
            }
        }

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
