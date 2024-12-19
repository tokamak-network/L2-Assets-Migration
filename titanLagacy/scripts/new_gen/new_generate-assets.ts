import fs from 'fs'
import path from 'path'
import { ethers } from 'hardhat'
import { BigNumber } from "ethers"
import { NonfungibleTokenPositionManager, L2Interface, ERC20, L1Interface, Pool, Closed, User, WithdrawClaimed } from '../types';
import { getWithdrawalClaimStatus, getCollectWETH, getTotalAddressAll, getContractAll, bigNumberAbs } from "../forceLib";

const main = async () => {
    
}

main().catch((error) => {
    console.log(error)
    process.exit(1);
  })
  