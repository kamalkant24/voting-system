const { contract, web3 } = require("../config/web3");
const VotingStatus = require("../models/votingStatus");
const User = require("../models/user");
const Candidate = require("../models/candidate");



const mongoose = require("mongoose"); // Import mongoose for ObjectId conversion

// Cast Vote
exports.castVote = async (req, res) => {
  const { walletAddress, candidateId } = req.body;

  try {
    // 🔹 Check if voting is open
    const status = await VotingStatus.findOne();
    if (!status?.isVotingOpen) {
      return res.status(400).json({ error: "Voting is closed!" });
    }

    // 🔹 Find user
    const user = await User.findOne({ walletAddress });
    if (!user) return res.status(404).json({ error: "User not found!" });
    if (user.hasVoted) return res.status(400).json({ error: "User has already voted!" });

    // 🔹 Find candidate by ObjectId, but use Solidity-compatible index
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) return res.status(404).json({ error: "Candidate not found!" });

    const candidateIndex = candidate.candidateIndex;
    if (!candidateIndex || typeof candidateIndex !== "number") {
      return res.status(400).json({ error: "Invalid candidate ID format!" });
    }

    // 🔹 Blockchain transaction
    try {
      console.log(`Voting for candidate index: ${candidateIndex}`);
      const transaction = contract.methods.vote(candidateIndex);
      const gasEstimate = await transaction.estimateGas({ from: walletAddress });

      console.log("Sending transaction...");
      const txReceipt = await transaction.send({ from: walletAddress, gas: gasEstimate });

      console.log("Transaction Successful:", txReceipt);
    } catch (error) {
      console.error("Blockchain transaction error:", error);
      return res.status(500).json({ error: "Blockchain transaction failed", details: error.message });
    }

    // 🔹 Update user & candidate data in database
    user.hasVoted = true;
    user.votedCandidate = candidateId;
    await user.save();

    candidate.voteCount += 1;
    await candidate.save();

    res.json({ message: "Vote cast successfully!" });

  } catch (error) {
    console.error("Voting failed:", error);
    res.status(500).json({ error: "Voting failed", details: error.message });
  }
};
