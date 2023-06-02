// scripts/deploy.js
import { ethers } from "hardhat";
import { expect } from "chai";

import hre from "hardhat";

async function main() {
  const myTokenV1 = await ethers.getContractFactory("OvalPixel");

  let proxyContract = await hre.upgrades.deployProxy(myTokenV1, {
    kind: "uups",
  });
  const [owner] = await ethers.getSigners();

  console.log("proxyContract", proxyContract.address);
  console.log("sniple limit", await proxyContract.snipeLimit());


  await hre.run("verify:verify", {
    address: "proxyContract.address",
    constructorArguments: [],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
