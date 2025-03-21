const mongoose = require("mongoose");

const ExchangeRateSchema = new mongoose.Schema({
    currencyPair: { type: String, required: true, unique: true }, // e.g., "USD/LKR"
    rate: { type: Number, required: true },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ExchangeRate", ExchangeRateSchema);
