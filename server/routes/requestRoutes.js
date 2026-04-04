const express = require("express");
const router = express.Router();
const {
  sendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  getRequestById,
  updateRequestStatus,
  cancelRequest,
} = require("../controllers/requestController");
const { protect } = require("../middleware/authMiddleware");

// All request routes are protected
router.post("/", protect, sendRequest);
router.get("/incoming", protect, getIncomingRequests);
router.get("/outgoing", protect, getOutgoingRequests);
router.get("/:id", protect, getRequestById);
router.put("/:id", protect, updateRequestStatus);
router.delete("/:id", protect, cancelRequest);

module.exports = router;