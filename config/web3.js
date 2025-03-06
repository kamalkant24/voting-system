const Web3 = require("web3");
const contractData = require("../contractABI.json");

const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545")); // Local network

const contract = new web3.eth.Contract(contractData.abi, "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"); // Correct address

module.exports = { web3, contract };
