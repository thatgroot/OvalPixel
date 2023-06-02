import { expect } from "chai";
import { ethers } from "hardhat";
import hre from "hardhat";

describe("ERC721 Upgradeable", function () {
  it("Should deploy an upgradeable ERC721 Contract", async function () {
    const proxyAddress = "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44"; // Replace with your actual proxy address

    const MyTokenV2 = await ethers.getContractFactory("OvalPixelV2");

    let proxyContract = await hre.upgrades.upgradeProxy(
      proxyAddress,
      MyTokenV2
    );
    await proxyContract.test();
    console.log("proxyContract", proxyContract.address);

    console.log("sniple limit", await proxyContract.snipeLimit());
  });
});
