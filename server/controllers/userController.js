const bcrypt = require("bcryptjs");
const User = require("../models/User");

// ─── GET OWN PROFILE ──────────────────────────────────────
// GET /api/users/profile (protected)
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        branch: user.branch,
        year: user.year,
        college: user.college,
        avatar: user.avatar,
        rating: user.rating,
        totalReviews: user.totalReviews,
        isAdmin: user.isAdmin,
        showEmail: user.showEmail,
        showPhone: user.showPhone,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ─── UPDATE OWN PROFILE ───────────────────────────────────
// PUT /api/users/profile (protected)
const updateMyProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      branch,
      year,
      college,
      showEmail,
      showPhone,
      currentPassword,
      newPassword,
    } = req.body;

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update basic fields if provided
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (branch !== undefined) user.branch = branch;
    if (year !== undefined) user.year = year;
    if (college !== undefined) user.college = college;
    if (showEmail !== undefined) user.showEmail = showEmail;
    if (showPhone !== undefined) user.showPhone = showPhone;

    // Handle avatar upload (will be used in Phase 4 with Cloudinary)
    if (req.file) {
      user.avatar = req.file.path;
    }

    // Handle password change if requested
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters",
        });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        branch: user.branch,
        year: user.year,
        college: user.college,
        avatar: user.avatar,
        rating: user.rating,
        totalReviews: user.totalReviews,
        isAdmin: user.isAdmin,
        showEmail: user.showEmail,
        showPhone: user.showPhone,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ─── GET ANY USER'S PUBLIC PROFILE ────────────────────────
// GET /api/users/:id (public)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Build public profile — respect privacy settings
    const publicProfile = {
      _id: user._id,
      name: user.name,
      branch: user.branch,
      year: user.year,
      college: user.college,
      avatar: user.avatar,
      rating: user.rating,
      totalReviews: user.totalReviews,
      createdAt: user.createdAt,
      // Only show email/phone if user allowed it
      email: user.showEmail ? user.email : null,
      phone: user.showPhone ? user.phone : null,
    };

    return res.status(200).json({
      success: true,
      user: publicProfile,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

module.exports = { getMyProfile, updateMyProfile, getUserById };