const Request = require("../models/Request");
const Listing = require("../models/Listing");
const Notification = require("../models/Notification");

// Helper: calculate days between two dates
const calculateDays = (fromDate, toDate) => {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const diffTime = Math.abs(to - from);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays || 1;
};

// ─── SEND REQUEST ─────────────────────────────────────────
// POST /api/requests (protected)
const sendRequest = async (req, res) => {
  try {
    const { listingId, fromDate, toDate, message } = req.body;

    // Validate required fields
    if (!listingId || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide listing, from date and to date",
      });
    }

    // Check listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Cannot request your own listing
    if (listing.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot request your own listing",
      });
    }

    // Check listing is available
    if (!listing.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "This item is not available right now",
      });
    }

    // Check if user already has a pending request for this listing
    const existingRequest = await Request.findOne({
      listing: listingId,
      requester: req.user._id,
      status: "pending",
    });
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending request for this item",
      });
    }

    // Validate dates
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (from >= to) {
      return res.status(400).json({
        success: false,
        message: "To date must be after from date",
      });
    }

    // Calculate duration and total price
    const duration = calculateDays(fromDate, toDate);
    let totalPrice = 0;
    if (listing.pricingType === "rent") {
      totalPrice = listing.price * duration;
    } else if (listing.pricingType === "sale") {
      totalPrice = listing.price;
    }

    // Create request
    const request = await Request.create({
      listing: listingId,
      requester: req.user._id,
      owner: listing.owner,
      fromDate,
      toDate,
      message: message || "",
      totalPrice,
      duration,
    });

    // Increment requests count on listing
    listing.requestsCount += 1;
    await listing.save();

    // Populate for response
    await request.populate([
      { path: "listing", select: "title pricingType price images category" },
      { path: "requester", select: "name avatar rating" },
      { path: "owner", select: "name avatar rating" },
    ]);

    return res.status(201).json({
      success: true,
      message: "Request sent successfully",
      request,
    });
  } catch (error) {
    console.error("Send request error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ─── GET INCOMING REQUESTS ────────────────────────────────
// GET /api/requests/incoming (protected)
// Requests that others sent to ME (I am the owner)
const getIncomingRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { owner: req.user._id };
    if (status) filter.status = status;

    const requests = await Request.find(filter)
      .populate("listing", "title pricingType price images category")
      .populate("requester", "name avatar rating branch year")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get incoming requests error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ─── GET OUTGOING REQUESTS ────────────────────────────────
// GET /api/requests/outgoing (protected)
// Requests that I sent to others
const getOutgoingRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { requester: req.user._id };
    if (status) filter.status = status;

    const requests = await Request.find(filter)
      .populate("listing", "title pricingType price images category")
      .populate("owner", "name avatar rating branch year")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get outgoing requests error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ─── GET SINGLE REQUEST ───────────────────────────────────
// GET /api/requests/:id (protected)
const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("listing", "title pricingType price images category condition")
      .populate("requester", "name avatar rating branch year college")
      .populate("owner", "name avatar rating branch year college");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Only requester or owner can view the request
    const isRequester =
      request.requester._id.toString() === req.user._id.toString();
    const isOwner =
      request.owner._id.toString() === req.user._id.toString();

    if (!isRequester && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this request",
      });
    }

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error("Get request error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ─── UPDATE REQUEST STATUS ────────────────────────────────
// PUT /api/requests/:id (protected — owner only)
// status can be: accepted | declined | completed
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["accepted", "declined", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use: accepted, declined, or completed",
      });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Only owner can accept/decline/complete
    if (request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the item owner can update request status",
      });
    }

    // Cannot update already declined/completed requests
    if (["declined", "completed", "cancelled"].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}`,
      });
    }

    request.status = status;
    await request.save();

    await request.populate([
      { path: "listing", select: "title pricingType price images category" },
      { path: "requester", select: "name avatar rating" },
      { path: "owner", select: "name avatar rating" },
    ]);

    return res.status(200).json({
      success: true,
      message: `Request ${status} successfully`,
      request,
    });
  } catch (error) {
    console.error("Update request error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ─── CANCEL REQUEST ───────────────────────────────────────
// DELETE /api/requests/:id (protected — requester only)
const cancelRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Only requester can cancel their own request
    if (request.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the requester can cancel this request",
      });
    }

    // Can only cancel pending requests
    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be cancelled",
      });
    }

    request.status = "cancelled";
    await request.save();

    // Decrease request count on listing
    await Listing.findByIdAndUpdate(request.listing, {
      $inc: { requestsCount: -1 },
    });

    return res.status(200).json({
      success: true,
      message: "Request cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel request error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

module.exports = {
  sendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  getRequestById,
  updateRequestStatus,
  cancelRequest,
};