const express = require("express");
const router = express.Router();
const {
  postReview,
  getReviewsByUser,
  getReviewsByListing,
  getMyReviews,
  deleteReview,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

// ⚠️ Specific routes BEFORE param routes
router.get("/my-reviews", protect, getMyReviews);
router.get("/user/:userId", getReviewsByUser);
router.get("/listing/:listingId", getReviewsByListing);

router.post("/", protect, postReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;