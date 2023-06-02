import { expect } from "chai";
import { Contract } from "ethers";
import { ethers, upgrades } from "hardhat";
import hre from "hardhat";

describe("Deployment", function () {
  let proxyContract: Contract;

  beforeEach(async function () {
    const MyTokenV1 = await ethers.getContractFactory("OvalPixel");
    proxyContract = await upgrades.deployProxy(MyTokenV1, [], { kind: "uups" });
  });

  it("Should deploy the proxy contract", async function () {
    expect(proxyContract.address).to.not.be.undefined;
  });

  // it("Should verify the proxy contract", async function () {
  //   const verification = await hre.run("verify:verify", {
  //     address: proxyContract.address,
  //     constructorArguments: [],
  //   });
  //   expect(verification.success).to.be.true;
  // });
});
