// scripts/upgrade.js
import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  const proxyAddress = "0x36C02dA8a0983159322a80FFE9F24b1acfF8B570"; // Replace with your actual proxy address

  const MyTokenV2 = await ethers.getContractFactory("OvalPixelV2");

  let proxyContract = await hre.upgrades.upgradeProxy(proxyAddress, MyTokenV2,{ kind: 'uups' });
  await proxyContract.test();
  console.log("proxyContract", proxyContract.address);

  console.log("sniple limit", await proxyContract.snipeLimit());
  await hre.run("verify:verify", {
    address: proxyContract.address,
    constructorArguments: [],
  });

  // Additional upgrade steps or interactions with the upgraded contract if needed
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
