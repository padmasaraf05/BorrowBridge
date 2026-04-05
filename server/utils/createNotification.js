const Notification = require("../models/Notification");

// Auto-create notification — called from request/message/review controllers
const createNotification = async ({
  recipient,
  type,
  message,
  link,
  relatedId,
}) => {
  try {
    await Notification.create({
      recipient,
      type,
      message,
      link: link || "",
      relatedId: relatedId || null,
      isRead: false,
    });
  } catch (error) {
    // Don't crash the main request if notification fails
    console.error("Create notification error:", error.message);
  }
};

module.exports = createNotification;