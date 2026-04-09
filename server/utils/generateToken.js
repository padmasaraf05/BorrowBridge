const jwt = require("jsonwebtoken");

// ✅ Must match authMiddleware.js exactly
const JWT_SECRET = "borrowbridge_super_secret_jwt_key_2025";
const JWT_EXPIRE = "30d";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

module.exports = generateToken;