import { ethers, run } from "hardhat";
import { BigNumber } from "ethers";
import { ERC20 } from "../../types";
import ProgressBar from 'progress';
import fs from 'fs'
import path from 'path'

import UpgradeL1Bridge_ABI from "../../../artifacts/contracts/UpgradeL1Bridge.sol/UpgradeL1Bridge.json"


const dir = "contracts/data/"
const forceOwner = "0x37212a8F2abbb40000e974DA82D410DdbecFa956" // sepolia l1brdige proxy owner
const closer = "0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea"
const dirPath = "data"


const main = async () => {
    console.log("Start");
    const owner = "0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea"
    await ethers.provider.send('hardhat_impersonateAccount', [owner])
    await ethers.provider.send('hardhat_setBalance', [owner, '0x152D02C7E14AF6800000']);
    const deployer:any = await ethers.provider.getSigner(owner)


    const jsonData = fs.readFileSync(path.join(dirPath, 'new-generate-assets.json'), "utf-8");
    const storageData = JSON.parse(jsonData);

    const L1BridgeProxyAddr = "0x1F032B938125f9bE411801fb127785430E7b3971"

    const oneETH = ethers.utils.parseUnits('1', 18)


    const UpgradeL1BridgeLogic = new ethers.Contract(
        L1BridgeProxyAddr,
        UpgradeL1Bridge_ABI.abi,
        deployer
    )

    let positionAddress = ""

    let TONHash = "0xd9f5d9d671fe106bbfb7a09190ad3442d6b09a407c1a4faa248662881cd4f887"
    let TONAmount = ethers.BigNumber.from("13937332320000000100000")
    let l1TON = "0xa30fe40285B8f5c0457DbC3B7C8A280373c40044"

    let ETHHash = ""
    let ETHAMount = ethers.BigNumber.from("")
    let l1ETH = "0x0000000000000000000000000000000000000000"


    let getAddress = await (await UpgradeL1BridgeLogic.connect(deployer).getForcePosition(TONHash)).wait();
    console.log("getAddress : ", getAddress);

    
    
    // await UpgradeL1BridgeLogic.connect(deployer).claim(
    //     positionAddress,
    //     TONHash,
    //     l1TON,
    //     TONAmount
    // )

}

main(10);
