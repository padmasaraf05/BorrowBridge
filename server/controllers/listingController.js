const Listing = require("../models/Listing");
const { cloudinary } = require("../config/cloudinary");

// ─── CREATE LISTING ───────────────────────────────────────
// POST /api/listings (protected)
const createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      condition,
      pricingType,
      price,
      availableFrom,
      availableTo,
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !condition || !pricingType) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Validate price for rent/sale
    if (pricingType !== "free" && (!price || price <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid price for rent/sale listings",
      });
    }

    // Get uploaded image URLs from Cloudinary (via multer)
    const images = req.files ? req.files.map((file) => file.path) : [];

    const listing = await Listing.create({
      title,
      description,
      category,
      condition,
      pricingType,
      price: pricingType === "free" ? 0 : Number(price),
      images,
      availableFrom: availableFrom || Date.now(),
      availableTo: availableTo || null,
      owner: req.user._id,
    });

    // Populate owner details before returning
    await listing.populate("owner", "name email avatar rating");

    return res.status(201).json({
      success: true,
      message: "Listing created successfully",
      listing,
    });
  } catch (error) {
    console.error("Create listing error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ─── GET ALL LISTINGS ─────────────────────────────────────
// GET /api/listings (public)
// Supports: ?category=&pricingType=&search=&sort=&page=&limit=&available=
const getAllListings = async (req, res) => {
  try {
    const {
      category,
      pricingType,
      search,
      sort,
      page = 1,
      limit = 12,
      available,
      minPrice,
      maxPrice,
    } = req.query;

    // Build filter object
    const filter = {};

    if (category) filter.category = category;
    if (pricingType && pricingType !== "All") {
      // Map frontend labels to DB values
      const typeMap = {
        "For Rent": "rent",
        "For Sale": "sale",
        Free: "free",
        rent: "rent",
        sale: "sale",
        free: "free",
      };
      filter.pricingType = typeMap[pricingType] || pricingType;
    }
    if (available === "true") filter.isAvailable = true;

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Sort options matching frontend dropdown
    const sortOptions = {
      newest: { createdAt: -1 },
      "price-low": { price: 1 },
      "price-high": { price: -1 },
      "top-rated": { createdAt: -1 }, // will update with rating later
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Listing.countDocuments(filter);
    const listings = await Listing.find(filter)
      .populate("owner", "name avatar rating")
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      listings,
    });
  } catch (error) {
    console.error("Get listings error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ─── GET SINGLE LISTING ───────────────────────────────────
// GET /api/listings/:id (public)
const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      "owner",
      "name email avatar rating totalReviews branch year college showEmail showPhone"
    );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Increment view count
    listing.views += 1;
    await listing.save();

    return res.status(200).json({
      success: true,
      listing,
    });
  } catch (error) {
    console.error("Get listing error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ─── UPDATE LISTING ───────────────────────────────────────
// PUT /api/listings/:id (protected — owner only)
const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Check ownership
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this listing",
      });
    }

    const {
      title,
      description,
      category,
      condition,
      pricingType,
      price,
      availableFrom,
      availableTo,
      isAvailable,
    } = req.body;

    // Update fields if provided
    if (title) listing.title = title;
    if (description) listing.description = description;
    if (category) listing.category = category;
    if (condition) listing.condition = condition;
    if (pricingType) listing.pricingType = pricingType;
    if (price !== undefined) listing.price = pricingType === "free" ? 0 : Number(price);
    if (availableFrom) listing.availableFrom = availableFrom;
    if (availableTo) listing.availableTo = availableTo;
    if (isAvailable !== undefined) listing.isAvailable = isAvailable;

    // Add new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.path);
      listing.images = [...listing.images, ...newImages].slice(0, 5); // max 5 images
    }

    await listing.save();
    await listing.populate("owner", "name avatar rating");

    return res.status(200).json({
      success: true,
      message: "Listing updated successfully",
      listing,
    });
  } catch (error) {
    console.error("Update listing error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ─── DELETE LISTING ───────────────────────────────────────
// DELETE /api/listings/:id (protected — owner only)
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Check ownership
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this listing",
      });
    }

    // Delete images from Cloudinary
    if (listing.images && listing.images.length > 0) {
      for (const imageUrl of listing.images) {
        try {
          // Extract public_id from Cloudinary URL
          const parts = imageUrl.split("/");
          const filename = parts[parts.length - 1].split(".")[0];
          const publicId = `borrowbridge/listings/${filename}`;
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Error deleting image from Cloudinary:", err);
        }
      }
    }

    await Listing.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error) {
    console.error("Delete listing error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ─── GET LISTINGS BY USER ─────────────────────────────────
// GET /api/listings/user/:userId (public)
const getListingsByUser = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.params.userId })
      .populate("owner", "name avatar rating")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: listings.length,
      listings,
    });
  } catch (error) {
    console.error("Get user listings error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ─── GET MY LISTINGS ──────────────────────────────────────
// GET /api/listings/my-listings (protected)
const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      total: listings.length,
      listings,
    });
  } catch (error) {
    console.error("Get my listings error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

module.exports = {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  getListingsByUser,
  getMyListings,
};