const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    category: { type: String, required: true },
    currency: { type: String, default: "LKR" },  //currency default is Rs.
    tags: { type: [String] },
    recurrence: { type: String, enum: ["none", "daily", "weekly", "monthly"], default: "none" },
    date: { type: Date, required: true },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", TransactionSchema);
