const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

// Create a new budget
exports.createBudget = async (req, res) => {
    try {
        const { category, limit, month, year } = req.body;

        // Check if the user already has a budget for the same category in the same month
        const existingBudget = await Budget.findOne({ userId: req.user.id, category, month, year });
        if (existingBudget) {
            return res.status(400).json({ message: "Budget for this category already exists for this month." });
        }

        const budget = new Budget({
            userId: req.user.id,
            category,
            limit,
            month,
            year
        });

        await budget.save();
        res.status(201).json(budget);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all budgets for the logged-in user
exports.getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ userId: req.user.id });
        res.status(200).json(budgets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a specific budget by ID
exports.getBudgetById = async (req, res) => {
    try {
        const budget = await Budget.findOne({ _id: req.params.id, userId: req.user.id });
        if (!budget) return res.status(404).json({ message: "Budget not found." });
        res.status(200).json(budget);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a budget
exports.updateBudget = async (req, res) => {
    try {
        const budget = await Budget.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );

        if (!budget) return res.status(404).json({ message: "Budget not found." });

        res.status(200).json(budget);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a budget
exports.deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

        if (!budget) return res.status(404).json({ message: "Budget not found." });

        res.status(200).json({ message: "Budget deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Check if a user is exceeding their budget for a category
exports.checkBudgetStatus = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: "Month and year are required." });
        }

        // Get all budgets for the user
        const budgets = await Budget.find({ userId: req.user.id, month, year });

        // Fetch total expenses for each budget category
        let results = [];
        for (let budget of budgets) {
            const totalSpent = await Transaction.aggregate([
                {
                    $match: {
                        userId: budget.userId,
                        category: budget.category,
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
            const percentage = ((spentAmount / budget.limit) * 100).toFixed(2);

            results.push({
                category: budget.category,
                limit: budget.limit,
                spent: spentAmount,
                percentage: percentage
            });
        }

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
