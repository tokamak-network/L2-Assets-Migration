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
    }
  },
  solidity: {
    version :"0.8.20",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 10000
      }
    }
  }
  // gasReporter: {
  //   enabled: true,
  //   currency: 'USD',
  //   gasPrice: 100,
  // }
};

export default config;
