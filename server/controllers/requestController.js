const Request = require("../models/Request");
const Listing = require("../models/Listing");
const createNotification = require("../utils/createNotification");

// Helper: calculate days between two dates
const calculateDays = (fromDate, toDate) => {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const diffTime = Math.abs(to - from);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays || 1;
};

// ─── SEND REQUEST ─────────────────────────────────────────
const sendRequest = async (req, res) => {
  try {
    const { listingId, fromDate, toDate, message } = req.body;

    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: "Please provide listing ID",
      });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    if (listing.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot request your own listing",
      });
    }

    if (!listing.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "This item is not available right now",
      });
    }

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

    // ✅ Only require dates for rent items, not sale or free
    let duration = 0;
    let totalPrice = 0;
    let resolvedFromDate = fromDate || new Date();
    let resolvedToDate = toDate || new Date();

    if (listing.pricingType === "rent") {
      if (!fromDate || !toDate) {
        return res.status(400).json({
          success: false,
          message: "Please select dates for rental",
        });
      }
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (from >= to) {
        return res.status(400).json({
          success: false,
          message: "To date must be after from date",
        });
      }
      duration = calculateDays(fromDate, toDate);
      totalPrice = listing.price * duration;
    } else if (listing.pricingType === "sale") {
      totalPrice = listing.price;
      resolvedFromDate = new Date();
      resolvedToDate = new Date();
    }
    // free items: price = 0, no dates needed

    const request = await Request.create({
      listing: listingId,
      requester: req.user._id,
      owner: listing.owner,
      fromDate: resolvedFromDate,
      toDate: resolvedToDate,
      message: message || "",
      totalPrice,
      duration,
    });

    listing.requestsCount += 1;
    await listing.save();

    await createNotification({
      recipient: listing.owner,
      type: "request_received",
      message: `${req.user.name} requested your item: "${listing.title}"`,
      link: `/requests`,
      relatedId: request._id,
    });

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

    const request = await Request.findById(req.params.id).populate(
      "listing",
      "title"
    );
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the item owner can update request status",
      });
    }

    if (["declined", "completed", "cancelled"].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}`,
      });
    }

    request.status = status;
    await request.save();

    // ✅ Notify the requester of status change
    const statusMessages = {
      accepted: `Your request for "${request.listing.title}" was accepted! 🎉`,
      declined: `Your request for "${request.listing.title}" was declined.`,
      completed: `Your transaction for "${request.listing.title}" is marked complete.`,
    };

    const notificationTypes = {
      accepted: "request_accepted",
      declined: "request_declined",
      completed: "request_accepted",
    };

    await createNotification({
      recipient: request.requester,
      type: notificationTypes[status],
      message: statusMessages[status],
      link: `/requests`,
      relatedId: request._id,
    });

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
const cancelRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate(
      "listing",
      "title"
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the requester can cancel this request",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be cancelled",
      });
    }

    request.status = "cancelled";
    await request.save();

    await Listing.findByIdAndUpdate(request.listing._id, {
      $inc: { requestsCount: -1 },
    });

    // ✅ Notify the owner that request was cancelled
    await createNotification({
      recipient: request.owner,
      type: "request_cancelled",
      message: `A request for "${request.listing.title}" was cancelled.`,
      link: `/requests`,
      relatedId: request._id,
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