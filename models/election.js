const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema({
  isVotingActive: { type: Boolean, default: false },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true }
});

module.exports = mongoose.model("Election", electionSchema);
