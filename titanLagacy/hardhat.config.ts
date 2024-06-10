import { HardhatUserConfig, types } from "hardhat/config";
import { task } from "hardhat/config";
import "hardhat-gas-reporter";
import "@nomicfoundation/hardhat-ethers"
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from 'dotenv'

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
        url: process.env.L1_RPC_URL_SDK || "", // process.env.CONTRACT_RPC_URL_L1 || "",
        // blockNumber: 19973387,
      }
    },

    main: {
      url: process.env.CONTRACT_RPC_URL_L1 || "",
      accounts: [process.env.L1_PORXY_OWNER || "", process.env.L1_FORCE_OWNER || ""]
    },
    test: {
      url: "http://127.0.0.1:8545/",
      // accounts: [process.env.L1_PORXY_OWNER || "", process.env.L1_FORCE_OWNER || ""]
    },
  },
  solidity: {
    version: "0.8.9",
    settings: {
      viaIR: true,
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