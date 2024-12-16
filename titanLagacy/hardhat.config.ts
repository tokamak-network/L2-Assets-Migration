import { HardhatUserConfig, types } from "hardhat/config";
import { task } from "hardhat/config";
import "hardhat-gas-reporter";
import "@nomicfoundation/hardhat-ethers"
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from 'dotenv'
import "hardhat-contract-sizer";

task("upgrade", "Upgrades the L1 bridge", async (args, hre) => {
  const { upgradeL1bridge } = require("./scripts/protocol/forceWithdraw");
  await upgradeL1bridge();
});

task("send", "Sends force withdraw transactions")
  .addParam("max", "The maximum number of transactions", 10, types.int)
  .setAction(async ({ max }, hre) => {
    const { sendForceWithdraw } = require("./scripts/protocol/forceWithdraw");
    await sendForceWithdraw(max);
  });

task("pause", "Pauses the contract", async (args, hre) => {
  const { pause } = require("./scripts/protocol/forceWithdraw");
  await pause();
});

task("testRun", "Check whether it operates properly in the forked environment.")
  .addParam("max", "The maximum number of transactions", 10, types.int)
  .setAction(async ({ max }, hre) => {
    const { upgradeL1bridge, sendForceWithdraw } = require("./scripts/protocol/forceWithdraw");
    await upgradeL1bridge(false)
    await sendForceWithdraw(10, false)
  });

dotenv.config()
const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      forking: {
        url: process.env.CONTRACT_RPC_URL_L1 || "", // sepolia
        // url: "http://127.0.0.1:8545", // sepolia
        //   // url: process.env.SEPOLIA_TITAN || "", // L2
      }
    },
    main: {
      url: process.env.CONTRACT_RPC_URL_L1 || "",
      // accounts: [process.env.L1_PORXY_OWNER || "", process.env.L1_FORCE_OWNER || ""]
    },
    sepolia: {
      url: process.env.CONTRACT_RPC_URL_L1 || "", // L1
      // url: process.env.SEPOLIA_TITAN || "", // L2
      accounts: [
        process.env.PERSONAL_ACCOUNT || "", // Personal account
        process.env.DEPLOYER_ACCOUNT || "", // Deployer account

      ],
    },
    titan: {
      url: `${process.env.ETH_NODE_URI_TITAN}`,
      accounts: [`${process.env.PERSONAL_ACCOUNT}`],
      chainId: 55004,
    },
    titansepolia: {
      url: `${process.env.ETH_NODE_URI_TITAN_SEPOLIA}`,
      accounts: [`${process.env.PERSONAL_ACCOUNT}`],
      chainId: 55007,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000
      }
    }
  },

  gasReporter: {
    enabled: true,
    currency: 'USD',
    gasPrice: 10,
  }
};

export default config;