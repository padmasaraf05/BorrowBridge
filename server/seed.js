// BorrowBridge Demo Seed Script
// Run: node seed.js from server folder

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGO_URI = "mongodb+srv://padmasaraf05_db_user:borrowbridge123@cluster0.rxlbiki.mongodb.net/borrowbridge?retryWrites=true&w=majority&appName=Cluster0";

// ─── Schemas ──────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: String, email: String, password: String,
  branch: String, year: String, college: String,
  phone: String, avatar: String,
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
  showEmail: { type: Boolean, default: false },
  showPhone: { type: Boolean, default: false },
}, { timestamps: true });

const listingSchema = new mongoose.Schema({
  title: String, description: String,
  category: String, condition: String,
  pricingType: String, price: Number,
  images: [String], isAvailable: { type: Boolean, default: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  views: { type: Number, default: 0 },
  requestsCount: { type: Number, default: 0 },
  availableFrom: Date, availableTo: Date,
}, { timestamps: true });

const requestSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fromDate: Date, toDate: Date,
  message: String, status: { type: String, default: "pending" },
  totalPrice: Number, duration: Number,
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String, listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
  request: { type: mongoose.Schema.Types.ObjectId, ref: "Request" },
  rating: Number, text: String,
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: String, message: String,
  link: String, isRead: { type: Boolean, default: false },
  relatedId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Listing = mongoose.model("Listing", listingSchema);
const Request = mongoose.model("Request", requestSchema);
const Message = mongoose.model("Message", messageSchema);
const Review = mongoose.model("Review", reviewSchema);
const Notification = mongoose.model("Notification", notificationSchema);

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Clear all
  await Promise.all([
    User.deleteMany({}), Listing.deleteMany({}),
    Request.deleteMany({}), Message.deleteMany({}),
    Review.deleteMany({}), Notification.deleteMany({}),
  ]);
  console.log("🗑️  Cleared existing data");

  // ─── Hash password ─────────────────────────────────────
  const hash = async (p) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(p, salt);
  };

  // ─── Create 6 Users ────────────────────────────────────
  const users = await User.insertMany([
    {
      name: "Padmashree Saraf", email: "padma@college.edu",
      password: await hash("padma123"), branch: "Information Science",
      year: "3", college: "Bangalore Institute of Technology",
      phone: "9876543210", rating: 4.8, totalReviews: 5,
      showEmail: true, showPhone: false,
    },
    {
      name: "Rahul Sharma", email: "rahul@college.edu",
      password: await hash("rahul123"), branch: "Computer Science",
      year: "2", college: "Bangalore Institute of Technology",
      phone: "9123456780", rating: 4.6, totalReviews: 3,
    },
    {
      name: "Priya Mehta", email: "priya@college.edu",
      password: await hash("priya123"), branch: "Electronics",
      year: "4", college: "Bangalore Institute of Technology",
      phone: "9988776655", rating: 4.9, totalReviews: 7,
    },
    {
      name: "Arjun Kumar", email: "arjun@college.edu",
      password: await hash("arjun123"), branch: "Mechanical",
      year: "1", college: "Bangalore Institute of Technology",
      rating: 4.3, totalReviews: 2,
    },
    {
      name: "Sneha Patel", email: "sneha@college.edu",
      password: await hash("sneha123"), branch: "Civil Engineering",
      year: "3", college: "Bangalore Institute of Technology",
      rating: 4.7, totalReviews: 4,
    },
    {
      name: "Vikram Joshi", email: "vikram@college.edu",
      password: await hash("vikram123"), branch: "Computer Science",
      year: "4", college: "Bangalore Institute of Technology",
      rating: 4.5, totalReviews: 6,
    },
  ]);

  const [padma, rahul, priya, arjun, sneha, vikram] = users;
  console.log("👥 Created 6 users");

  // ─── Create 12 Listings ────────────────────────────────
  const listings = await Listing.insertMany([
    // Padma's listings
    {
      title: "Engineering Mathematics Vol. 2",
      description: "Well-maintained textbook covering Advanced Calculus, Differential Equations and Linear Algebra. Ideal for 2nd year engineering students. Minor pencil annotations on a few pages, otherwise excellent condition.",
      category: "Textbooks", condition: "Good",
      pricingType: "rent", price: 60,
      images: ["https://images-na.ssl-images-amazon.com/images/I/51nRGtFqZHL._SX379_BO1,204,203,200_.jpg"],
      owner: padma._id, views: 42, requestsCount: 3,
      isAvailable: true,
    },
    {
      title: "Scientific Calculator (Casio fx-991EX)",
      description: "Like new Casio fx-991EX calculator with all advanced functions. Works perfectly, comes with original cover. Perfect for engineering exams.",
      category: "Calculators", condition: "Like New",
      pricingType: "sale", price: 750,
      images: ["https://m.media-amazon.com/images/I/71S7BpwxYeL._SL1500_.jpg"],
      owner: padma._id, views: 38, requestsCount: 5,
      isAvailable: true,
    },
    {
      title: "Arduino Uno Starter Kit",
      description: "Complete Arduino Uno R3 starter kit with breadboard, jumper wires, LEDs, resistors and basic components. Used for one semester project, everything works perfectly.",
      category: "Electronics", condition: "Good",
      pricingType: "rent", price: 80,
      images: ["https://m.media-amazon.com/images/I/81yHe+xGMpL._SL1500_.jpg"],
      owner: padma._id, views: 29, requestsCount: 2,
      isAvailable: true,
    },
    // Rahul's listings
    {
      title: "Data Structures & Algorithms (Cormen)",
      description: "Introduction to Algorithms by Cormen - the Bible of DSA. 3rd edition, hardcover. Some highlighting in first 3 chapters only. Must-have for placements.",
      category: "Textbooks", condition: "Good",
      pricingType: "sale", price: 450,
      images: ["https://m.media-amazon.com/images/I/61Pgdn8Ys-L._SL1360_.jpg"],
      owner: rahul._id, views: 55, requestsCount: 7,
      isAvailable: true,
    },
    {
      title: "Lab Coat (White, Size M)",
      description: "Clean white lab coat, size M. Used only for chemistry labs in 1st year. Washed and ironed. Good condition.",
      category: "Lab Equipment", condition: "Good",
      pricingType: "free", price: 0,
      images: ["https://m.media-amazon.com/images/I/51dP0FxXgkL.jpg"],
      owner: rahul._id, views: 18, requestsCount: 4,
      isAvailable: true,
    },
    // Priya's listings
    {
      title: "USB-C Hub 7-in-1 (Anker)",
      description: "Anker 7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader and PD charging. Perfect for presentations and lab work. Barely used.",
      category: "Electronics", condition: "Like New",
      pricingType: "rent", price: 30,
      images: ["https://m.media-amazon.com/images/I/71tWrgxO5xL._SL1500_.jpg"],
      owner: priya._id, views: 33, requestsCount: 2,
      isAvailable: true,
    },
    {
      title: "Organic Chemistry by Morrison & Boyd",
      description: "Classic organic chemistry textbook, 6th edition. Comprehensive coverage of all topics. Some pages have pencil marks which can be erased. Good for 2nd year chemistry.",
      category: "Textbooks", condition: "Fair",
      pricingType: "rent", price: 40,
      images: ["https://m.media-amazon.com/images/I/41kWZJAp-oL.jpg"],
      owner: priya._id, views: 27, requestsCount: 3,
      isAvailable: true,
    },
    // Arjun's listings
    {
      title: "LED Desk Lamp (Adjustable, USB)",
      description: "USB powered LED desk lamp with adjustable brightness and color temperature. Perfect for late night studying in hostel. Selling as I am going home.",
      category: "Hostel Items", condition: "Good",
      pricingType: "sale", price: 350,
      images: ["https://m.media-amazon.com/images/I/71vMDNbDq0L._SL1500_.jpg"],
      owner: arjun._id, views: 21, requestsCount: 1,
      isAvailable: true,
    },
    {
      title: "Extension Board 4-Socket (Havells)",
      description: "Havells 4-socket extension board with surge protection, 2 meter cable. Essential for hostel room. Sharing as I have 2.",
      category: "Hostel Items", condition: "Good",
      pricingType: "rent", price: 20,
      images: ["https://m.media-amazon.com/images/I/71LiI6NHDKL._SL1500_.jpg"],
      owner: arjun._id, views: 16, requestsCount: 2,
      isAvailable: true,
    },
    // Sneha's listings
    {
      title: "Physics Lab Manual (VTU)",
      description: "Complete VTU Physics Lab Manual with all observations filled. Useful as reference for your own lab. Free to take, just pick up from hostel.",
      category: "Lab Equipment", condition: "Fair",
      pricingType: "free", price: 0,
      images: [],
      owner: sneha._id, views: 14, requestsCount: 3,
      isAvailable: true,
    },
    // Vikram's listings
    {
      title: "Wireless Mouse Logitech M235",
      description: "Logitech M235 wireless mouse, 2.4GHz with USB nano receiver. Smooth scrolling, 12 month battery life. Selling as I upgraded to trackpad.",
      category: "Electronics", condition: "Good",
      pricingType: "sale", price: 500,
      images: ["https://m.media-amazon.com/images/I/61ni3t1ryQL._SL1500_.jpg"],
      owner: vikram._id, views: 44, requestsCount: 6,
      isAvailable: true,
    },
    {
      title: "Engineering Drawing Kit (Staedtler)",
      description: "Complete Staedtler engineering drawing kit with compass, divider, set squares, protractor and pencils. Used in 1st year. Good condition.",
      category: "Lab Equipment", condition: "Good",
      pricingType: "rent", price: 25,
      images: ["https://m.media-amazon.com/images/I/71oBFTBq3dL._SL1500_.jpg"],
      owner: vikram._id, views: 19, requestsCount: 2,
      isAvailable: true,
    },
  ]);

  console.log("📦 Created 12 listings");

  // ─── Create Requests ───────────────────────────────────
  const requests = await Request.insertMany([
    // Rahul borrows Padma's Maths book — ACCEPTED
    {
      listing: listings[0]._id, requester: rahul._id, owner: padma._id,
      fromDate: new Date("2026-04-10"), toDate: new Date("2026-04-17"),
      message: "Hi! I need this for my upcoming exams. Will take great care of it.",
      status: "accepted", totalPrice: 420, duration: 7,
    },
    // Arjun requests Padma's calculator — PENDING
    {
      listing: listings[1]._id, requester: arjun._id, owner: padma._id,
      fromDate: new Date("2026-04-12"), toDate: new Date("2026-04-12"),
      message: "Need this for my semester exam next week.",
      status: "pending", totalPrice: 750, duration: 0,
    },
    // Sneha borrows Rahul's DSA book — COMPLETED
    {
      listing: listings[3]._id, requester: sneha._id, owner: rahul._id,
      fromDate: new Date("2026-03-01"), toDate: new Date("2026-03-15"),
      message: "Preparing for placements, this book is a must!",
      status: "completed", totalPrice: 450, duration: 0,
    },
    // Priya borrows Padma's Arduino — ACCEPTED
    {
      listing: listings[2]._id, requester: priya._id, owner: padma._id,
      fromDate: new Date("2026-04-08"), toDate: new Date("2026-04-15"),
      message: "Working on IoT project for final year. Need Arduino for a week.",
      status: "accepted", totalPrice: 560, duration: 7,
    },
    // Vikram requests Priya's USB hub — PENDING
    {
      listing: listings[5]._id, requester: vikram._id, owner: priya._id,
      fromDate: new Date("2026-04-11"), toDate: new Date("2026-04-14"),
      message: "Need it for project presentation this Friday.",
      status: "pending", totalPrice: 90, duration: 3,
    },
    // Arjun borrows Vikram's drawing kit — DECLINED
    {
      listing: listings[11]._id, requester: arjun._id, owner: vikram._id,
      fromDate: new Date("2026-04-05"), toDate: new Date("2026-04-08"),
      message: "Need for engineering drawing assignment.",
      status: "declined", totalPrice: 75, duration: 3,
    },
  ]);

  console.log("📋 Created 6 requests");

  // ─── Create Messages ───────────────────────────────────
  await Message.insertMany([
    // Rahul ↔ Padma (about Maths book)
    {
      sender: rahul._id, receiver: padma._id,
      text: "Hey! I saw your listing for Engineering Maths Vol. 2. Is it still available?",
      listing: listings[0]._id, isRead: true,
      createdAt: new Date("2026-04-09T09:30:00"),
    },
    {
      sender: padma._id, receiver: rahul._id,
      text: "Yes it's available! When do you need it?",
      listing: listings[0]._id, isRead: true,
      createdAt: new Date("2026-04-09T09:35:00"),
    },
    {
      sender: rahul._id, receiver: padma._id,
      text: "From 10th April to 17th. I have exams starting next week.",
      listing: listings[0]._id, isRead: true,
      createdAt: new Date("2026-04-09T09:37:00"),
    },
    {
      sender: padma._id, receiver: rahul._id,
      text: "That works! It'll be ₹60/day so ₹420 total. I'm in Hostel B, Room 214.",
      listing: listings[0]._id, isRead: true,
      createdAt: new Date("2026-04-09T09:40:00"),
    },
    {
      sender: rahul._id, receiver: padma._id,
      text: "Perfect! I'll come pick it up tomorrow morning around 9 AM.",
      listing: listings[0]._id, isRead: true,
      createdAt: new Date("2026-04-09T09:42:00"),
    },
    {
      sender: padma._id, receiver: rahul._id,
      text: "Sure, see you then! All the best for your exams 😊",
      listing: listings[0]._id, isRead: false,
      createdAt: new Date("2026-04-09T09:45:00"),
    },
    // Priya ↔ Padma (about Arduino)
    {
      sender: priya._id, receiver: padma._id,
      text: "Hi Padmashree! Is the Arduino kit available from 8th to 15th April?",
      listing: listings[2]._id, isRead: true,
      createdAt: new Date("2026-04-08T14:00:00"),
    },
    {
      sender: padma._id, receiver: priya._id,
      text: "Yes! It has all components. What project are you working on?",
      listing: listings[2]._id, isRead: true,
      createdAt: new Date("2026-04-08T14:15:00"),
    },
    {
      sender: priya._id, receiver: padma._id,
      text: "Smart home automation for final year project. The kit looks perfect!",
      listing: listings[2]._id, isRead: false,
      createdAt: new Date("2026-04-08T14:20:00"),
    },
  ]);

  console.log("💬 Created 9 messages");

  // ─── Create Reviews ────────────────────────────────────
  const reviews = await Review.insertMany([
    // Sneha reviews Rahul (after buying DSA book)
    {
      reviewer: sneha._id, reviewedUser: rahul._id,
      listing: listings[3]._id, request: requests[2]._id,
      rating: 5,
      text: "Rahul was super responsive and the book was exactly as described. Great condition! Would definitely borrow from him again.",
      createdAt: new Date("2026-03-16"),
    },
    // Rahul reviews Sneha (as borrower)
    {
      reviewer: rahul._id, reviewedUser: sneha._id,
      listing: listings[3]._id, request: requests[2]._id,
      rating: 5,
      text: "Sneha returned the book in perfect condition, even a day early! Very responsible borrower.",
      createdAt: new Date("2026-03-16"),
    },
    // Priya reviews Padma (about a previous transaction)
    {
      reviewer: priya._id, reviewedUser: padma._id,
      listing: listings[0]._id, request: requests[0]._id,
      rating: 5,
      text: "Padmashree is very punctual and friendly. The item was exactly as described. Highly recommend!",
      createdAt: new Date("2026-04-01"),
    },
    // Vikram reviews Padma
    {
      reviewer: vikram._id, reviewedUser: padma._id,
      listing: listings[1]._id, request: requests[1]._id,
      rating: 4,
      text: "Good experience overall. Calculator worked perfectly for my exams. Will use BorrowBridge again!",
      createdAt: new Date("2026-03-20"),
    },
    // Arjun reviews Priya
    {
      reviewer: arjun._id, reviewedUser: priya._id,
      listing: listings[5]._id, request: requests[4]._id,
      rating: 5,
      text: "USB hub worked flawlessly for my presentation. Priya was very helpful and flexible with timing.",
      createdAt: new Date("2026-03-25"),
    },
  ]);

  console.log("⭐ Created 5 reviews");

  // ─── Update user ratings ───────────────────────────────
  // Padma: 2 reviews avg 4.5 → update to 4.8 (already set above)
  await User.findByIdAndUpdate(padma._id, { rating: 4.8, totalReviews: 3 });
  await User.findByIdAndUpdate(rahul._id, { rating: 4.8, totalReviews: 2 });
  await User.findByIdAndUpdate(priya._id, { rating: 4.8, totalReviews: 2 });
  await User.findByIdAndUpdate(sneha._id, { rating: 4.9, totalReviews: 1 });

  // ─── Create Notifications ──────────────────────────────
  await Notification.insertMany([
    // Padma's notifications
    {
      recipient: padma._id, type: "request_received",
      message: 'Arjun Kumar requested your item: "Scientific Calculator (Casio fx-991EX)"',
      link: "/requests", isRead: false,
      createdAt: new Date("2026-04-09T10:00:00"),
    },
    {
      recipient: padma._id, type: "request_accepted",
      message: 'Priya Mehta accepted your request for "Arduino Uno Starter Kit" 🎉',
      link: "/requests", isRead: false,
      createdAt: new Date("2026-04-08T15:00:00"),
    },
    {
      recipient: padma._id, type: "review_received",
      message: "You received a 5-star review from Priya Mehta! ⭐",
      link: "/profile", isRead: true,
      createdAt: new Date("2026-04-01T12:00:00"),
    },
    {
      recipient: padma._id, type: "message_received",
      message: "Rahul Sharma sent you a message about Engineering Mathematics Vol. 2",
      link: "/messages", isRead: true,
      createdAt: new Date("2026-04-09T09:30:00"),
    },
    {
      recipient: padma._id, type: "review_received",
      message: "You received a 4-star review from Vikram Joshi! ⭐",
      link: "/profile", isRead: true,
      createdAt: new Date("2026-03-20T09:00:00"),
    },
    // Rahul's notifications
    {
      recipient: rahul._id, type: "request_accepted",
      message: 'Padmashree accepted your request for "Engineering Mathematics Vol. 2" 🎉',
      link: "/requests", isRead: false,
      createdAt: new Date("2026-04-09T11:00:00"),
    },
    {
      recipient: rahul._id, type: "review_received",
      message: "You received a 5-star review from Sneha Patel! ⭐",
      link: "/profile", isRead: true,
      createdAt: new Date("2026-03-16T10:00:00"),
    },
  ]);

  console.log("🔔 Created 7 notifications");

  console.log("\n✅ ═══════════════════════════════════════");
  console.log("   DEMO DATA SEEDED SUCCESSFULLY!");
  console.log("═══════════════════════════════════════");
  console.log("\n👥 LOGIN CREDENTIALS:");
  console.log("─────────────────────────────────────");
  console.log("📧 padma@college.edu     | 🔑 padma123   (Main demo account)");
  console.log("📧 rahul@college.edu     | 🔑 rahul123");
  console.log("📧 priya@college.edu     | 🔑 priya123");
  console.log("📧 arjun@college.edu     | 🔑 arjun123");
  console.log("📧 sneha@college.edu     | 🔑 sneha123");
  console.log("📧 vikram@college.edu    | 🔑 vikram123");
  console.log("─────────────────────────────────────");
  console.log("\n📊 SEEDED:");
  console.log("  • 6 users across different branches");
  console.log("  • 12 listings (mix of rent/sale/free)");
  console.log("  • 6 requests (pending/accepted/completed/declined)");
  console.log("  • 9 messages (2 conversations)");
  console.log("  • 5 reviews with ratings");
  console.log("  • 7 notifications");
  console.log("\n🎯 DEMO TIP: Login as padma@college.edu");
  console.log("   Dashboard will show real stats & activity!\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});