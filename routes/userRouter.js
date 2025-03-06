// routes/authRoutes.js
require('dotenv').config();
const express = require("express");
const { register, login } = require("../controllers/authController");
const { castVote } = require("../controllers/votingController");
const { addCandidate } = require("../controllers/candidateController");
const {registerAdmin,loginAdmin, startVoting, stopVoting, getResults, getAllUsers,getWinner } = require("../controllers/adminController");

const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");
const router = express.Router();

// User//
router.post("/register", register);
router.post("/login", login);

// candidate //
router.post("/add-candidate", addCandidate);

// voting //
router.post("/vote", authMiddleware, castVote);

// Admin can start and stop voting
router.post("/registerAdmin", registerAdmin); // ✅ Admin Register
router.post("/loginAdmin", loginAdmin);  
router.post("/start-voting", authMiddleware, isAdmin, startVoting);
router.post("/stop-voting", authMiddleware, isAdmin, stopVoting);
router.get("/results", authMiddleware, isAdmin, getResults);
router.get('/winner', authMiddleware, isAdmin,getWinner )
// Get all registered users (for admin dashboard)
router.get("/users", authMiddleware,isAdmin,getAllUsers);

module.exports = router;