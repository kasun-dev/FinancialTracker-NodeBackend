const express = require("express");
const {
    generateReport,
    getReports,
    getReportById,
    deleteReport
} = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, generateReport); // Generate a new report
router.get("/", authMiddleware, getReports); // Get all reports for a user
router.get("/:id", authMiddleware, getReportById); // Get a specific report by ID
router.delete("/:id", authMiddleware, deleteReport); // Delete a report

module.exports = router;
