const express = require("express");
const {
    getAllExchangeRates,
    getExchangeRate,
    addOrUpdateExchangeRate,
    deleteExchangeRate
} = require("../controllers/exchangeController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public Routes
router.get("/", getAllExchangeRates);
router.get("/:pair", getExchangeRate);

// Admin Routes
router.post("/", authMiddleware, addOrUpdateExchangeRate);
router.delete("/:pair", authMiddleware, deleteExchangeRate);

module.exports = router;
