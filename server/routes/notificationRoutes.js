const express = require("express");
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

// All notification routes are protected
// ⚠️ Specific routes BEFORE param routes
router.get("/unread-count", protect, getUnreadCount);
router.put("/read-all", protect, markAllAsRead);

router.get("/", protect, getNotifications);
router.put("/:id/read", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);

module.exports = router;