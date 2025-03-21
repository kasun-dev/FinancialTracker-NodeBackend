const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    limit: { type: Number, required: true },
    month: { type: Number, min: 1, max: 12, required: true },  // January = 1, December = 12
    year: { type: Number, required: true },
    alertSent: { type: Boolean, default: false },  // Whether an alert has been sent
}, { timestamps: true });

module.exports = mongoose.model("Budget", BudgetSchema);
