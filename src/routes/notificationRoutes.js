const express = require("express");
const {
    createNotification,
    getUserNotifications,
    markAsRead,
    deleteNotification
} = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Route to create a new notification (Admin only)
router.post("/", authMiddleware, createNotification);

// Route to get notifications for the logged-in user
router.get("/", authMiddleware, getUserNotifications);

// Route to mark a notification as read
router.put("/:id/read", authMiddleware, markAsRead);

// Route to delete a notification
router.delete("/:id", authMiddleware, deleteNotification);

module.exports = router;
