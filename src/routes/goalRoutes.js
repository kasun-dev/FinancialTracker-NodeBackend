const express = require("express");
const { 
    createGoal, 
    getGoals, 
    getGoalById, 
    updateGoal, 
    deleteGoal 
} = require("../controllers/goalsController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createGoal);      // Create a new goal
router.get("/", authMiddleware, getGoals);        // Get all goals for the user
router.get("/:id", authMiddleware, getGoalById);  // Get a specific goal
router.put("/:id", authMiddleware, updateGoal);   // Update a goal
router.delete("/:id", authMiddleware, deleteGoal); // Delete a goal

module.exports = router;
