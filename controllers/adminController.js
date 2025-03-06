const Vote = require("../models/votingStatus");
const Candidate = require("../models/candidate");
const User = require("../models/user");
const Election = require("../models/election");
const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const VotingStatus = require("../models/votingStatus"); // Ensure the correct path


// ✅ Admin Register
exports.registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return res.status(400).json({ error: "Admin already exists!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ name, email, password: hashedPassword });

    await admin.save();
    res.status(201).json({ message: "Admin registered successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Admin registration failed", details: error.message });
  }
};

// ✅ Admin Login
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ error: "Admin not found!" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "8h" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Admin login failed", details: error.message });
  }
};
// Start the voting process

// Start Voting
exports.startVoting = async (req, res) => {
  try {
    let election = await Election.findOne();
    if (!election) {
      election = new Election({
        isVotingActive: true,
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      await election.save();
    } else if (!election.isVotingActive) {
      election.isVotingActive = true;
      election.startTime = new Date();
      election.endTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await election.save();
    } else {
      return res.status(400).json({ error: "Voting is already active!" });
    }

    // ✅ Ensure VotingStatus exists and update it
    let votingStatus = await VotingStatus.findOne();
    if (!votingStatus) {
      votingStatus = new VotingStatus({
        isVotingOpen: true,
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        election: election._id,
      });
      await votingStatus.save();
    } else {
      votingStatus.isVotingOpen = true;
      votingStatus.startTime = new Date();
      votingStatus.endTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await votingStatus.save();
    }

    res.status(200).json({ message: "Voting has started." });
  } catch (error) {
    res.status(500).json({ error: "Failed to start voting", details: error.message });
  }
};
// Stop Voting
exports.stopVoting = async (req, res) => {
  try {
    const election = await Election.findOne();
    if (!election || !election.isVotingActive) {
      return res.status(400).json({ error: "No active election found or voting is already stopped." });
    }

    election.isVotingActive = false;
    election.endTime = new Date();
    await election.save();

    // ✅ Ensure VotingStatus exists before updating
    let votingStatus = await VotingStatus.findOne();
    if (votingStatus) {
      votingStatus.isVotingOpen = false;
      votingStatus.endTime = new Date();
      await votingStatus.save();
    }

    res.status(200).json({ message: "Voting has been stopped successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to stop voting", details: error.message });
  }
};

// Get Voting Results
exports.getResults = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ voteCount: -1 });
    res.status(200).json({ results: candidates });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch results", details: error.message });
  }
};

// Get All Users (Admin Only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users", details: error.message });
  }
};
 // get Winner (Admin Only) //
exports.getWinner = async (req, res) => {
  try {
    // Step 1: Check if the voting has ended
    const votingStatus = await VotingStatus.findOne();
    if (!votingStatus || !votingStatus.isVotingOpen || new Date() < votingStatus.endTime) {
      return res.status(400).json({ error: "Voting is still active. Please wait until voting ends." });
    }

    // Step 2: Find the candidate with the highest vote count
    const candidates = await Candidate.find().sort({ voteCount: -1 });
    if (candidates.length === 0) {
      return res.status(400).json({ error: "No candidates available for the election." });
    }

    // The first candidate in the sorted list will have the highest vote count
    const winner = candidates[0];

    // Step 3: Return the winner details
    res.status(200).json({ winner });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch winner", details: error.message });
  }
};