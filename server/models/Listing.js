const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Textbooks",
        "Lab Equipment",
        "Calculators",
        "Hostel Items",
        "Electronics",
        "Others",
      ],
    },
    condition: {
      type: String,
      required: [true, "Condition is required"],
      enum: ["Like New", "Good", "Fair", "Worn"],
    },
    // Pricing type matches frontend: free | rent | sale
    pricingType: {
      type: String,
      required: [true, "Pricing type is required"],
      enum: ["free", "rent", "sale"],
    },
    price: {
      type: Number,
      default: 0,
    },
    // Array of Cloudinary image URLs
    images: [
      {
        type: String,
      },
    ],
    availableFrom: {
      type: Date,
      default: Date.now,
    },
    availableTo: {
      type: Date,
      default: null,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    // Reference to the user who created the listing
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Track views and requests count
    views: {
      type: Number,
      default: 0,
    },
    requestsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for faster search queries
listingSchema.index({ title: "text", description: "text" });
listingSchema.index({ category: 1, pricingType: 1, isAvailable: 1 });

module.exports = mongoose.model("Listing", listingSchema);