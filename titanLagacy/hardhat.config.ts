import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers"
import * as dotenv from 'dotenv'

dotenv.config()

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      forking: {
        url: "https://rpc.tokamak.network/",
      }
    },
    main :{
      url: process.env.CONTRACT_RPC_URL_L1 || "",
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
    gasPrice: 6,
  }
};

export default config;
