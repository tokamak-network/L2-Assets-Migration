import { HardhatUserConfig } from "hardhat/config";
import "hardhat-gas-reporter";
import "@nomicfoundation/hardhat-ethers"
import "@nomicfoundation/hardhat-toolbox";

import * as dotenv from 'dotenv'

dotenv.config()

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      forking: {
        url: process.env.L1_PRC_URL_SDK || "",
        blockNumber: 19973387
      }
    },
    main :{
      url: process.env.CONTRACT_RPC_URL_L1 || "",
      accounts: [process.env.L1_PORXY_OWNER || "", process.env.L1_FORCE_OWNER || ""]
    },
    test :{
      url: "https://eth-sepolia.g.alchemy.com/v2/0bwKZXOmm5eG2Ff5-zx-_okYXky0Ijnq",
      accounts: [process.env.L1_PORXY_OWNER || "", process.env.L1_FORCE_OWNER || ""]
    },
  },
  solidity: {
    version :"0.8.9",
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
