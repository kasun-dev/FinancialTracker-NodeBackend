const Goal = require("../models/Goals");
const Transaction = require("../models/Transaction");
const Notification = require("../models/Notification");

// Create a new financial goal
exports.createGoal = async (req, res) => {
    try {
        const { goalName, targetAmount, deadline, autoAllocate } = req.body;

        const newGoal = await Goal.create({
            userId: req.user.id,
            goalName,
            targetAmount,
            deadline,
            autoAllocate,
        });

        res.status(201).json(newGoal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all goals for the authenticated user
exports.getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user.id });
        res.status(200).json(goals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single goal by ID
exports.getGoalById = async (req, res) => {
    try {
        const goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id });

        if (!goal) return res.status(404).json({ message: "Goal not found" });

        res.status(200).json(goal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a goal (e.g., progress update)
exports.updateGoal = async (req, res) => {
    try {
        const { goalName, targetAmount, allocatedAmount, currentSavings, deadline, autoAllocate } = req.body;

        // Find the existing goal
        const goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id });

        if (!goal) return res.status(404).json({ message: "Goal not found" });

        // Calculate the amount newly allocated
        const additionalAmount = allocatedAmount - (goal.allocatedAmount || 0);

        if (additionalAmount > 0) {
            // Create a new transaction entry as an expense
            await Transaction.create({
                userId: req.user.id,
                amount: additionalAmount,
                category: "Savings",
                type: "expense",
                description: `Allocated to goal: ${goalName}`,
                date: new Date()
            });

            // Send a notification to the user
            await Notification.create({
                userId: req.user.id,
                message: `You allocated ${additionalAmount} towards your goal: ${goalName}`,
                date: new Date(),
                read: false
            });
        }

        // Update the goal with new values
        const updatedGoal = await Goal.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { goalName, targetAmount, allocatedAmount, currentSavings, deadline, autoAllocate },
            { new: true }
        );

        res.status(200).json(updatedGoal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a goal
exports.deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

        if (!goal) return res.status(404).json({ message: "Goal not found" });

        res.status(200).json({ message: "Goal deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
