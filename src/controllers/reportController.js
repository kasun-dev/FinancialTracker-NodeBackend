const Report = require("../models/Report");
const Transaction = require("../models/Transaction");
const moment = require("moment");

// Generate a report based on user transactions
exports.generateReport = async (req, res) => {
    try {
        const { type, startDate, endDate, categories } = req.body;
        const userId = req.user.id;

        // Ensure startDate and endDate are valid
        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start date and end date are required" });
        }

        // Fetch transactions within the given date range
        let filter = { userId, date: { $gte: new Date(startDate), $lte: new Date(endDate) } };
        if (categories && categories.length > 0) {
            filter.category = { $in: categories };
        }

        const transactions = await Transaction.find(filter);

        // Calculate total income and expenses
        const totalIncome = transactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = transactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);

        // Group transactions by category
        const categoryBreakdown = transactions.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {});

        // Store the report in the database
        const reportData = {
            totalIncome,
            totalExpense,
            netBalance: totalIncome - totalExpense,
            categoryBreakdown,
        };

        const report = await Report.create({
            userId,
            type,
            startDate,
            endDate,
            categories,
            data: reportData,
        });

        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ message: "Error generating report", error: error.message });
    }
};

// Fetch all reports for a user
exports.getReports = async (req, res) => {
    try {
        const reports = await Report.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reports", error: error.message });
    }
};

// Fetch a single report by ID
exports.getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: "Error fetching report", error: error.message });
    }
};

// Delete a report
exports.deleteReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }
        await report.remove();
        res.status(200).json({ message: "Report deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting report", error: error.message });
    }
};
