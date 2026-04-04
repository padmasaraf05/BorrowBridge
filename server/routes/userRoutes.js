const express = require("express");
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  getUserById,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// Protected routes (require login)
router.get("/profile", protect, getMyProfile);
router.put("/profile", protect, updateMyProfile);

// Public route (view any user's profile)
router.get("/:id", getUserById);

module.exports = router;