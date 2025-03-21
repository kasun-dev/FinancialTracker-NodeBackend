const Goal = require("../models/Goals");

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
        const { goalName, targetAmount, currentSavings, deadline, autoAllocate } = req.body;

        const goal = await Goal.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { goalName, targetAmount, currentSavings, deadline, autoAllocate },
            { new: true }
        );

        if (!goal) return res.status(404).json({ message: "Goal not found" });

        res.status(200).json(goal);
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
