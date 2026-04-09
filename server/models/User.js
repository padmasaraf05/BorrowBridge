const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    branch: { type: String, default: "" },
    year: { type: String, default: "" },
    college: { type: String, default: "" },
    phone: { type: String, default: "" },
    avatar: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isAdmin: { type: Boolean, default: false },
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ❌ NO pre-save hook — hashing is done manually in controller
// This prevents accidental double-hashing

module.exports = mongoose.model("User", userSchema);