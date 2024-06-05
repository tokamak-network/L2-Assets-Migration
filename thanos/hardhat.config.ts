import { HardhatUserConfig } from "hardhat/config";
import "hardhat-gas-reporter";
import "@nomicfoundation/hardhat-ethers"
import "@nomicfoundation/hardhat-toolbox";

import * as dotenv from 'dotenv'

dotenv.config()

const config: HardhatUserConfig = {
  networks: {
    // hardhat: {
    //   forking: {
    //     url: process.env.L1_RPC_URL_SDK || "", // process.env.CONTRACT_RPC_URL_L1 || "",
    // //     // blockNumber: 19973387,
    //   }
    // },
    
    main :{
      url: process.env.CONTRACT_RPC_URL_L1 || "",
      accounts: [process.env.L1_PORXY_OWNER || "", process.env.L1_FORCE_OWNER || ""]
    },
    test :{
      url: "http://127.0.0.1:8545/",
      // accounts: [process.env.L1_PORXY_OWNER || "", process.env.L1_FORCE_OWNER || ""]
    },
  },
  solidity: {
    version :"0.8.15",
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