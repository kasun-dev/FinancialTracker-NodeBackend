const express = require("express");
const {
    createBudget,
    getBudgets,
    getBudgetById,
    updateBudget,
    deleteBudget,
    checkBudgetStatus
} = require("../controllers/budgetController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createBudget);
router.get("/", authMiddleware, getBudgets);
router.get("/:id", authMiddleware, getBudgetById);
router.put("/:id", authMiddleware, updateBudget);
router.delete("/:id", authMiddleware, deleteBudget);
router.get("/status/check", authMiddleware, checkBudgetStatus);

module.exports = router;
