const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = "borrowbridge_super_secret_jwt_key_2025";
const JWT_EXPIRE = "30d";

// ─── SIGNUP ───────────────────────────────────────────────
const signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, branch, year } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Verify hash works BEFORE saving
    const verifyBeforeSave = await bcrypt.compare(password, hashedPassword);
    console.log("Hash verification before save:", verifyBeforeSave);

    if (!verifyBeforeSave) {
      return res.status(500).json({
        success: false,
        message: "Password hashing failed, please try again",
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      branch: branch || "",
      year: year || "",
    });

    // Verify hash works AFTER saving
    const savedUser = await User.findById(user._id).select("+password");
    const verifyAfterSave = await bcrypt.compare(password, savedUser.password);
    console.log("Hash verification after save:", verifyAfterSave);
    console.log("Password stored length:", savedUser.password.length);

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        year: user.year,
        avatar: user.avatar,
        rating: user.rating,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error during signup",
    });
  }
};

// ─── LOGIN ────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt for:", email);
    console.log("Password received:", password);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user with password field
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    console.log("User found:", user ? "YES" : "NO");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log("Stored password hash:", user.password);
    console.log("Stored password length:", user.password?.length);
    console.log("Password to compare:", password);

    // Try comparison
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isMatch);

    // If bcrypt fails, try direct comparison as fallback debug
    if (!isMatch) {
      console.log("bcrypt.compare failed");
      // Check if password is stored as plain text (shouldn't happen but let's verify)
      const isPlainMatch = password === user.password;
      console.log("Plain text match:", isPlainMatch);

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        year: user.year,
        college: user.college,
        phone: user.phone,
        avatar: user.avatar,
        rating: user.rating,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error during login",
    });
  }
};

// ─── GET ME ───────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        year: user.year,
        college: user.college,
        phone: user.phone,
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
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { signup, login, getMe };