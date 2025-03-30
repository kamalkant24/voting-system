const hre = require("hardhat");

async function main() {
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(); // ✅ Deploy the contract

  await voting.waitForDeployment(); // ✅ Fix: wait for deployment properly

  console.log("Voting contract deployed to:", await voting.getAddress()); // ✅ Use getAddress()
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
