const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const errorMiddleware = require("./middleware/errorMiddleware");

// Set environment variables
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "datgqarwm";
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "353943956995324";
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "8NpoxJM8VcTnREUzG_Fw1iYrvjE";
process.env.PORT = process.env.PORT || "5000";
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "borrowbridge_super_secret_jwt_key_2025";
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || "30d";
process.env.NODE_ENV = process.env.NODE_ENV || "development";

// Connect to MongoDB
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Routes ───────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 BorrowBridge API is running!",
    version: "1.0.0",
  });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/listings", require("./routes/listingRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});