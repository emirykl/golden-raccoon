import { ethers } from "hardhat";

async function main() {
  const GoldRaccoonVault = await ethers.getContractFactory("GoldRaccoonVault");
  const vault = await GoldRaccoonVault.deploy();

  await vault.waitForDeployment();

  console.log(`GoldRaccoonVault deployed to ${await vault.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
