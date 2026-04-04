const express = require("express");
const router = express.Router();
const {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  getListingsByUser,
  getMyListings,
} = require("../controllers/listingController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

// Public routes
router.get("/", getAllListings);
router.get("/user/:userId", getListingsByUser);

// Protected routes
router.get("/my-listings", protect, getMyListings);
router.post("/", protect, upload.array("images", 5), createListing);
router.put("/:id", protect, upload.array("images", 5), updateListing);
router.delete("/:id", protect, deleteListing);

// Keep this last — specific routes above must come first
router.get("/:id", getListingById);

module.exports = router;