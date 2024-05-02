import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from 'dotenv'

dotenv.config()


const getRPC = () => {
  if (!process.env.CONTRACTS_RPC_URL_L2) {
    console.log('RPC URL is not set.');
    process.exit(1);
  }
  return process.env.CONTRACTS_RPC_URL_L2;

}

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  // gasReporter: {
  //   enabled: true,
  //   currency: 'USD',
  //   gasPrice: 100,
  // }

};

export default config;
