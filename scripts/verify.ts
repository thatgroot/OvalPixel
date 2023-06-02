import { expect } from "chai";

import hre from "hardhat";

async function main() {


  await hre.run("verify:verify", {
    address: "0x8b68a2fe243442a762C6020F409A08378527cDf1",
    constructorArguments: [],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
