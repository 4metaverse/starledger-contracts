import { ethers } from "hardhat";

async function main() {
  const StarLedgerNFT = await ethers.getContractFactory("StarLedgerNFT");

  const starLedgerNFT = await StarLedgerNFT.deploy();
  console.log("Contract deployed to address:", starLedgerNFT.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
