const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  candidateIndex: { type: Number, unique: true }, // 👈 Add Solidity-compatible ID
  name: { type: String, required: true },
  details: String,
  walletAddress: { type: String, unique: true, sparse: true }, // Optional for blockchain identity
  voteCount: { type: Number, default: 0 }
});

module.exports = mongoose.model("Candidate", candidateSchema);
