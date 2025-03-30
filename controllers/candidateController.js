const { contract, web3 } = require("../config/web3");
const Candidate = require("../models/candidate");

// Add Candidate API
exports.addCandidate = async (req, res) => {
  const { name, details, walletAddress } = req.body;

  try {
    // Check if candidate exists in MongoDB
    const existingCandidate = await Candidate.findOne({ walletAddress });
    if (existingCandidate) {
      return res.status(400).json({ error: "Candidate with this wallet address already exists!" });
    }

    // 🔹 Add candidate to Solidity first
    const accounts = await web3.eth.getAccounts(); // Get admin account
    const adminAddress = accounts[0];

    const transaction = contract.methods.addCandidate(name);
    const gasEstimate = await transaction.estimateGas({ from: adminAddress });

    const txReceipt = await transaction.send({ from: adminAddress, gas: gasEstimate });

    console.log("Candidate added to Solidity:", txReceipt);

    // 🔹 Retrieve candidate index from Solidity
    const candidatesCount = await contract.methods.candidatesCount().call();

    // 🔹 Add candidate to MongoDB with Solidity-compatible index
    const candidate = new Candidate({
      candidateIndex: Number(candidatesCount), // Ensure it's a number
      name,
      details,
      walletAddress,
      voteCount: 0
    });

    await candidate.save();

    res.status(201).json({ message: "Candidate added successfully!", candidate });
  } catch (error) {
    console.error("Candidate addition failed:", error);
    res.status(500).json({ error: "Candidate addition failed", details: error.message });
  }
};
