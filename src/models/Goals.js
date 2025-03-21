const mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    goalName: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentSavings: { type: Number, default: 0 },
    deadline: { type: Date, required: true },
    autoAllocate: { type: Boolean, default: false }, // Automatically allocate savings from income
}, { timestamps: true });

module.exports = mongoose.model("Goal", GoalSchema);
