const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // Who receives this notification
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "request_received",   // owner gets this
        "request_accepted",   // requester gets this
        "request_declined",   // requester gets this
        "request_cancelled",  // owner gets this
        "message_received",   // user gets this
        "review_received",    // user gets this
      ],
      required: true,
    },
    // Human readable message
    message: {
      type: String,
      required: true,
    },
    // Optional link to relevant page
    link: {
      type: String,
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Reference to related request/listing/message
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);