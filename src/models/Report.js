const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["monthly", "yearly", "custom"], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    categories: { type: [String], default: [] },
    data: { type: Object, required: true }, // Stores calculated financial data
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", ReportSchema);
