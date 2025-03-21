const express = require("express");
const { registerUser, loginUser, getUserProfile, getAllUsers, updateUserRole, deleteUser } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected Routes
router.get("/profile", authMiddleware, getUserProfile);

// Admin Routes
router.get("/", authMiddleware, getAllUsers);
router.put("/role/:id", authMiddleware, updateUserRole);
router.delete("/:id", authMiddleware, deleteUser);

module.exports = router;
