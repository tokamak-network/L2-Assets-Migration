import fs from 'fs'
import path from 'path'
import { ethers } from 'hardhat'
import { BigNumber } from "ethers"
import { NonfungibleTokenPositionManager, L2Interface, ERC20, L1Interface, Pool, Closed, User, WithdrawClaimed } from '../types';
import { getWithdrawalClaimStatus, getCollectWETH, getTotalAddressAll, getContractAll, bigNumberAbs } from "../forceLib";

const dirPath = "data"

const main = async () => {
    let jsonData = fs.readFileSync(path.join(dirPath, '5.titansepolia_asset_eoa.json'), "utf-8")
    let assetsData = JSON.parse(jsonData)
    const outContract = [];

    console.log(assetsData.length[0]);
    console.log(assetsData.length[1]);

    // keccak256(abi.encodePacked(_token, _claimer, _amount));
    for (let i=0; i < assetsData.length; i++) {
        // console.log(i);
        // console.log(assetsData.length);
        // const inner = {
        //     l1Token: data.l1Token,
        //     l2Token: data.l2Token,
        //     tokenName: data.tokenName,
        //     data: new Array()
        // }
        // for (const userData of data.data) {
        //     inner.data.push({
        //         "claimer": userData.claimer,
        //         "amount": userData.amount,
        //         "hash": ethers.utils.solidityKeccak256(['address', 'address', 'uint256'], [data.l1Token, userData.claimer, userData.amount])
        //     })
        // }
        // outContract.push(inner)
    }
    // fs.writeFile(path.join(dirPath, 'generate-assets3.json'), JSON.stringify(outContract, null, 1), 'utf-8', (err) => {
    //     if (err) {
    //     console.log(err);
    //     }
    // })
}

main().catch((error) => {
    console.log(error)
    process.exit(1);
  })
  