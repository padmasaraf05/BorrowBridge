const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getConversation,
  getConversations,
  deleteMessage,
  getUnreadCount,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

// All message routes are protected
// ⚠️ IMPORTANT: specific routes must come BEFORE /:userId
router.get("/conversations", protect, getConversations);
router.get("/unread-count", protect, getUnreadCount);

router.post("/", protect, sendMessage);
router.get("/:userId", protect, getConversation);
router.delete("/:id", protect, deleteMessage);

module.exports = router;