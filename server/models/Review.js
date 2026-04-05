const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    // Who wrote the review
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Who is being reviewed
    reviewedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Which listing this review is about
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    // Which request this review is linked to
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
    },
    // Star rating 1-5 matching frontend stars
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    // Review text matching Profile.tsx review cards
    text: {
      type: String,
      required: [true, "Review text is required"],
      trim: true,
      minlength: [10, "Review must be at least 10 characters"],
    },
  },
  { timestamps: true }
);

// One review per request — prevent duplicate reviews
reviewSchema.index({ reviewer: 1, request: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);