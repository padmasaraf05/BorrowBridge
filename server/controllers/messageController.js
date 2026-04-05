const Message = require("../models/Message");
const User = require("../models/User");

// ─── SEND MESSAGE ─────────────────────────────────────────
// POST /api/messages (protected)
const sendMessage = async (req, res) => {
  try {
    const { receiverId, text, listingId } = req.body;

    // Validate fields
    if (!receiverId || !text) {
      return res.status(400).json({
        success: false,
        message: "Please provide receiver and message text",
      });
    }

    // Cannot message yourself
    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot message yourself",
      });
    }

    // Check receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    // Create message
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text: text.trim(),
      listing: listingId || null,
    });

    // Populate sender info for response
    await message.populate("sender", "name avatar");
    await message.populate("receiver", "name avatar");
    if (message.listing) {
      await message.populate("listing", "title images pricingType");
    }

    return res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ─── GET CONVERSATION WITH A USER ─────────────────────────
// GET /api/messages/:userId (protected)
// Returns all messages between logged-in user and another user
const getConversation = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const myId = req.user._id;

    // Check other user exists
    const otherUser = await User.findById(otherUserId).select(
      "name avatar branch year"
    );
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get all messages between both users
    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherUserId },
        { sender: otherUserId, receiver: myId },
      ],
    })
      .populate("sender", "name avatar")
      .populate("listing", "title images pricingType")
      .sort({ createdAt: 1 }); // oldest first for chat display

    // Mark all unread messages from other user as read
    await Message.updateMany(
      { sender: otherUserId, receiver: myId, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({
      success: true,
      otherUser,
      messages,
    });
  } catch (error) {
    console.error("Get conversation error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ─── GET ALL CONVERSATIONS ────────────────────────────────
// GET /api/messages/conversations (protected)
// Returns latest message from each unique conversation
// Matches the sidebar in Messages.tsx
const getConversations = async (req, res) => {
  try {
    const myId = req.user._id;

    // Find all messages where I am sender or receiver
    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }],
    })
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar")
      .populate("listing", "title")
      .sort({ createdAt: -1 });

    // Build conversation list — one entry per unique user
    const conversationMap = new Map();

    for (const msg of messages) {
      // Determine the other person in this conversation
      const isMe = msg.sender._id.toString() === myId.toString();
      const otherUser = isMe ? msg.receiver : msg.sender;
      const otherUserId = otherUser._id.toString();

      // Only keep the latest message per conversation
      if (!conversationMap.has(otherUserId)) {
        // Count unread messages from this user
        const unreadCount = await Message.countDocuments({
          sender: otherUserId,
          receiver: myId,
          isRead: false,
        });

        conversationMap.set(otherUserId, {
          userId: otherUser._id,
          name: otherUser.name,
          avatar: otherUser.avatar,
          lastMessage: msg.text,
          lastMessageTime: msg.createdAt,
          unreadCount,
          // For the "Re: Item" banner in chat
          listingTitle: msg.listing ? msg.listing.title : null,
          listingId: msg.listing ? msg.listing._id : null,
        });
      }
    }

    // Convert map to array sorted by latest message
    const conversations = Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    return res.status(200).json({
      success: true,
      total: conversations.length,
      conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ─── DELETE MESSAGE ───────────────────────────────────────
// DELETE /api/messages/:id (protected — sender only)
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only sender can delete their message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the sender can delete this message",
      });
    }

    await Message.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete message error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ─── GET UNREAD COUNT ─────────────────────────────────────
// GET /api/messages/unread-count (protected)
// Used for notification badge in navbar
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getConversations,
  deleteMessage,
  getUnreadCount,
};