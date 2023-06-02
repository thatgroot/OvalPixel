import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";

describe("OvalPixel", function () {
  let playToEarn: Contract;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  before(async () => {
    const OvalPixel = await ethers.getContractFactory("OvalPixel");
    [owner, user1, user2] = await ethers.getSigners();
    playToEarn = await OvalPixel.deploy();
    console.log("playToEarn.address", playToEarn.address);
    // initialize
    await playToEarn.initialize();
    await playToEarn.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct initial supply and contract parameters", async function () {
      expect(await playToEarn.name()).to.equal("OvalPixel");
      expect(await playToEarn.symbol()).to.equal("OvalPixelOPAIG");
      expect(await playToEarn.totalSupply()).to.equal(
        1000000000000000000000000n
      );
    });

    it("Should set the owner as the initial token holder", async function () {
      expect(await playToEarn.balanceOf(owner.address)).to.equal(
        1000000000000000000000000n
      );
    });
  });

  describe("Function: setMaxGasPrice", function () {
    it("Should set the maximum gas price", async function () {
      const maxGasPrice = ethers.utils.parseUnits("1000000000", "gwei");
      await playToEarn.setMaxGasPrice(maxGasPrice);
      expect(await playToEarn.maxGasPrice()).to.equals(maxGasPrice);
    });

    it("Should revert if called by a non-owner account", async function () {
      const maxGasPrice = ethers.utils.parseUnits("100000000000000", "gwei");
      await expect(
        playToEarn.connect(user1).setMaxGasPrice(maxGasPrice)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Function: setMaxTokensPerWallet", function () {
    it("Should set the maximum tokens per wallet", async function () {
      const maxTokensPerWallet = 5;
      await playToEarn.setMaxTokensPerWallet(maxTokensPerWallet);
      expect(await playToEarn.maxTokensPerWallet()).to.equal(
        maxTokensPerWallet
      );
    });

    it("Should revert if called by a non-owner account", async function () {
      const maxTokensPerWallet = 5;

      await expect(
        playToEarn.connect(user1).setMaxTokensPerWallet(maxTokensPerWallet)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  // describe("Function: addToBlacklist", function () {
  //   it("Should add an address to the blacklist", async function () {
  //     await playToEarn.addToBlacklist(user1.address);
  //     expect(await playToEarn.isBlacklisted(user1.address)).to.be.true;
  //   });

  //   it("Should revert if called by a non-owner account", async function () {
  //     await expect(
  //       playToEarn.connect(user1).addToBlacklist(user2.address)
  //     ).revertedWith("Ownable: caller is not the owner");
  //   });
  // });

  // describe("Function: removeFromBlacklist", function () {
  //   beforeEach(async () => {
  //     await playToEarn.addToBlacklist(user1.address);
  //   });

  //   it("Should remove an address from the blacklist", async function () {
  //     await playToEarn.removeFromBlacklist(user1.address);
  //     expect(await playToEarn.isBlacklisted(user1.address)).to.be.false;
  //   });

  //   it("Should revert if called by a non-owner account", async function () {
  //     await expect(
  //       playToEarn.connect(user1).removeFromBlacklist(user1.address)
  //     ).revertedWith("Ownable: caller is not the owner");
  //   });
  // });

  describe("Function: removeFromBlacklist", function () {
    it("Should add an address to the whitelist", async function () {
      await playToEarn.removeFromBlacklist(user1.address);
      expect(await playToEarn.isWhitelisted(user1.address)).to.be.true;
    });

    it("Should revert if called by a non-owner account", async function () {
      await expect(
        playToEarn.connect(user1).removeFromBlacklist(user2.address)
      ).revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Function: addToBlacklist", function () {
    beforeEach(async () => {
      await playToEarn.removeFromBlacklist(user1.address);
    });

    it("Should remove an address from the whitelist", async function () {
      await playToEarn.addToBlacklist(user1.address);
      expect(await playToEarn.isWhitelisted(user1.address)).to.be.false;
    });

    it("Should revert if called by a non-owner account", async function () {
      await expect(
        playToEarn.connect(user1).addToBlacklist(user1.address)
      ).revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Function: mint", function () {
    it("Should mint tokens to the specified address", async function () {
      await playToEarn.mint(user1.address, 5);
      expect(
        ethers.BigNumber.from(
          await playToEarn.balanceOf(user1.address)
        ).toNumber()
      ).to.be.equals(5);
    });

    it("Should revert if called by a non-owner account", async function () {
      const amount = 5;
      await expect(
        playToEarn.connect(user2).mint(user2.address, amount)
      ).revertedWith("Sender is not a mintable wallet");
    });
  });

  describe("Function: burn", function () {
    // beforeEach(async () => {
    //   const amount = 5;
    //   await playToEarn.mint(user1.address, amount);
    // });

    it("Should burn tokens from the specified address", async function () {
      console.log('balance of', await playToEarn.balanceOf(user1.address));
      const amount = 5;
      await playToEarn.approve(playToEarn.address, amount);
      await expect(playToEarn.burnFrom(user1.address, 1)).revertedWith('ERC20: insufficient allowance');
      expect(await playToEarn.balanceOf(user1.address)).to.equal(5);
    });

    it("Should revert if called by a non-owner account", async function () {
      const amount = 5;
      await expect(
        playToEarn.connect(user1).burnTokens(user2.address, amount)
      ).revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Token Transfers", function () {
    before(async () => {
      await playToEarn.mint(user1.address, 5);
      await playToEarn.mint(user2.address, 5);
      await playToEarn.removeFromBlacklist(user1.address);
      await playToEarn.removeFromBlacklist(user2.address);
    });
    it("Should allow a whitelisted address to transfer tokens", async function () {
      const amount = 5;
      await playToEarn.connect(user2).transfer(user1.address, amount);
      expect(await playToEarn.balanceOf(user1.address)).to.equal(amount + 10);
    });

    // it("Should revert if a blacklisted address attempts to transfer tokens", async function () {
    //   await playToEarn.addToBlacklist(user1.address);
    //   const amount = 10;
    //   expect(
    //     await playToEarn.transfer(user1.address, amount)
    //   ).revertedWith("Address is blacklisted");
    // });

    it("Should revert if a non-whitelisted address attempts to receive tokens", async function () {
      await playToEarn.addToBlacklist(user1.address);
      const amount = 3;
      await expect(playToEarn.transfer(user1.address, amount)).revertedWith(
        "Address is not whitelisted"
      );
    });

    // it("Should prevent sniping between consecutive transfers", async function () {
    //   await playToEarn.removeFromBlacklist(user1.address);
    //   const amount = 10;
    //   await playToEarn.transfer(user1.address, amount);

    //   await expect(playToEarn.transfer(user2.address, amount)).revertedWith(
    //     "Sniping is currently prevented"
    //   );
    // });
  });
});
