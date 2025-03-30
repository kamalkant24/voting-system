const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  walletAddress: { type: String, unique: true, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  hasVoted: { type: Boolean, default: false },
  votedCandidate: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", default: null },
});

// Remove username index if not needed
// Remove `username` if it's not required
// module.exports = mongoose.model("User", userSchema);
module.exports = mongoose.model("User", userSchema);
