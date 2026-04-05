const Review = require("../models/Review");
const User = require("../models/User");
const Request = require("../models/Request");

// Helper: recalculate and update user's average rating
const updateUserRating = async (userId) => {
  const reviews = await Review.find({ reviewedUser: userId });

  if (reviews.length === 0) {
    await User.findByIdAndUpdate(userId, { rating: 0, totalReviews: 0 });
    return;
  }

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = parseFloat((totalRating / reviews.length).toFixed(1));

  await User.findByIdAndUpdate(userId, {
    rating: averageRating,
    totalReviews: reviews.length,
  });
};

// ─── POST REVIEW ──────────────────────────────────────────
// POST /api/reviews (protected)
const createNotification = require("../utils/createNotification");
const postReview = async (req, res) => {
  try {
    const { requestId, rating, text } = req.body;

    // Validate fields
    if (!requestId || !rating || !text) {
      return res.status(400).json({
        success: false,
        message: "Please provide requestId, rating and review text",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Check request exists and is completed/accepted
    const request = await Request.findById(requestId).populate(
      "listing",
      "title"
    );
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (!["accepted", "completed"].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: "You can only review after a request is accepted or completed",
      });
    }

    // Determine who is being reviewed
    // Requester reviews the owner, owner reviews the requester
    const isRequester =
      request.requester.toString() === req.user._id.toString();
    const isOwner = request.owner.toString() === req.user._id.toString();

    if (!isRequester && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this transaction",
      });
    }

    const reviewedUserId = isRequester ? request.owner : request.requester;

    // Cannot review yourself
    if (reviewedUserId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot review yourself",
      });
    }

    // Check if already reviewed this request
    const existingReview = await Review.findOne({
      reviewer: req.user._id,
      request: requestId,
    });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this transaction",
      });
    }

    // Create review
    const review = await Review.create({
      reviewer: req.user._id,
      reviewedUser: reviewedUserId,
      listing: request.listing._id,
      request: requestId,
      rating: Number(rating),
      text: text.trim(),
    });

    // Update the reviewed user's average rating
    await updateUserRating(reviewedUserId);

    // Populate for response
    await review.populate("reviewer", "name avatar branch year");
    await review.populate("reviewedUser", "name avatar");
    await review.populate("listing", "title category");
// ✅ Notify the reviewed user
await createNotification({
  recipient: reviewedUserId,
  type: "review_received",
  message: `You received a ${rating}-star review from ${req.user.name}! ⭐`,
  link: `/profile`,
  relatedId: review._id,
});
    return res.status(201).json({
      success: true,
      message: "Review posted successfully",
      review,
    });
  } catch (error) {
    // Handle duplicate review error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this transaction",
      });
    }
    console.error("Post review error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ─── GET REVIEWS FOR A USER ───────────────────────────────
// GET /api/reviews/user/:userId (public)
// Used in Profile.tsx "Reviews Received" tab
const getReviewsByUser = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewedUser: req.params.userId })
      .populate("reviewer", "name avatar branch year")
      .populate("listing", "title category")
      .sort({ createdAt: -1 });

    // Calculate average rating
    const averageRating =
      reviews.length > 0
        ? parseFloat(
            (
              reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            ).toFixed(1)
          )
        : 0;

    return res.status(200).json({
      success: true,
      total: reviews.length,
      averageRating,
      reviews,
    });
  } catch (error) {
    console.error("Get user reviews error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ─── GET REVIEWS FOR A LISTING ────────────────────────────
// GET /api/reviews/listing/:listingId (public)
// Used in ItemDetail.tsx reviews section
const getReviewsByListing = async (req, res) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate("reviewer", "name avatar branch year")
      .sort({ createdAt: -1 });

    const averageRating =
      reviews.length > 0
        ? parseFloat(
            (
              reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            ).toFixed(1)
          )
        : 0;

    return res.status(200).json({
      success: true,
      total: reviews.length,
      averageRating,
      reviews,
    });
  } catch (error) {
    console.error("Get listing reviews error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ─── GET MY REVIEWS GIVEN ─────────────────────────────────
// GET /api/reviews/my-reviews (protected)
// Reviews that I have written
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.user._id })
      .populate("reviewedUser", "name avatar")
      .populate("listing", "title category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get my reviews error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ─── DELETE REVIEW ────────────────────────────────────────
// DELETE /api/reviews/:id (protected — reviewer only)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Only reviewer can delete their review
    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the reviewer can delete this review",
      });
    }

    const reviewedUserId = review.reviewedUser;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate rating after deletion
    await updateUserRating(reviewedUserId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

module.exports = {
  postReview,
  getReviewsByUser,
  getReviewsByListing,
  getMyReviews,
  deleteReview,
};