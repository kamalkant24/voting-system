// const mongoose = require("mongoose");

// const voteHistorySchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
//   transactionHash: String
// });

// module.exports = mongoose.model("VoteHistory", voteHistorySchema);
const mongoose = require("mongoose");

const votingStatusSchema = new mongoose.Schema({
  isVotingOpen: { type: Boolean, default: false },
  startTime: Date,
  endTime: Date,
  election: { type: mongoose.Schema.Types.ObjectId, ref: "Election" }
});

module.exports = mongoose.model("VotingStatus", votingStatusSchema);

