const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    // The item being requested
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    // Student who is sending the request
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Owner of the listing
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Date range from ItemDetail.tsx form
    fromDate: {
      type: Date,
      required: [true, "From date is required"],
    },
    toDate: {
      type: Date,
      required: [true, "To date is required"],
    },
    // Optional message from ItemDetail.tsx textarea
    message: {
      type: String,
      trim: true,
      default: "",
    },
    // Request status flow: pending → accepted/declined → completed
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "completed", "cancelled"],
      default: "pending",
    },
    // Calculated total price at time of request
    totalPrice: {
      type: Number,
      default: 0,
    },
    // Duration in days
    duration: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", requestSchema);