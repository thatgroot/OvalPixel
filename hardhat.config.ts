import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  // networks
  networks: {
    mumbai: {
      url: "https://polygon-mumbai.infura.io/v3/4458cf4d1689497b9a38b1d6bbf05e78",
      // url: "https://polygon-mainnet.infura.io/v3/fd10107df0964880b3639b8160a0d583",
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: "4SQ6123B47QF2QCPJYM1TPHIDR9X8E5DQV",
      // polygon: "4JQHVWM285VYPKN18ZQW794KEH825K7M6E",
    },
  },
};

export default config;
