import { ethers, run } from "hardhat";
import { BigNumber } from "ethers";
import { ERC20 } from "../../types";
import ProgressBar from 'progress';
import fs from 'fs'
import path from 'path'
const dir = "contracts/data/"
const forceOwner = "0x37212a8F2abbb40000e974DA82D410DdbecFa956" // sepolia l1brdige proxy owner
const closer = "0x6526728cfDcB07C63CA66fE36b5aA202067eE75b"

const forking = async () => {
    await ethers.provider.send('hardhat_impersonateAccount', [forceOwner])
    await ethers.provider.send('hardhat_setBalance', [forceOwner, '0x152D02C7E14AF6800000']);
    const deployer:any = await ethers.provider.getSigner(forceOwner)
    const proxy = await ethers.getContractAt("Proxy", process.env.CONTRACTS_L1BRIDGE_ADDRESS)
    const l1bridgeABI = require("../../../artifacts/contracts/UpgradeL1Bridge.sol/UpgradeL1Bridge.json");
    await proxy.connect(deployer).setCode(l1bridgeABI.deployedBytecode)
}

export const registry = async () => {
    // <-- test account
    const owner = "0x6526728cfDcB07C63CA66fE36b5aA202067eE75b"
    await ethers.provider.send('hardhat_impersonateAccount', [owner])
    await ethers.provider.send('hardhat_setBalance', [owner, '0x152D02C7E14AF6800000']);
    const deployer:any = await ethers.provider.getSigner(owner)
    // -->
    
    //deploy assets data contract
    const fs = require("fs");
    // const deployer = ethers.provider.getSigner(1)
    const dataCount =  fs.readdirSync(dir);

    let sufIndex = 1;
    const dataContracts = []
    while (sufIndex <= dataCount.length) {
        const storageContract = await (await ethers.getContractFactory(`GenFWStorage${sufIndex}`, deployer as any)).deploy()
        await storageContract.deployed()
        console.log("storage",sufIndex,"address : ", storageContract.address)
        dataContracts.push(storageContract.address)
        sufIndex++;
    }  

    //registry contracts
    const l1bridge = await ethers.getContractAt("UpgradeL1Bridge", process.env.CONTRACTS_L1BRIDGE_ADDRESS)
    
    for (let i = 0; i < dataContracts.length; i++) {
        await l1bridge.connect(deployer).forceRegistry(dataContracts)
    }

    // registry check
    console.log("positions Check : ", await l1bridge.positions(0))
    // console.log(await l1bridge.positions(1))
    // console.log(await l1bridge.position(dataContracts[0]))
    // await (upgradedContract.connect(deployer as any) as any).forceActive(true);
}



export const main = async (max:number) => {
    // <-- test account
    await forking()
    await registry()
    // --> 

    // check environment variables
    if (process.env.DEPLOYER_ACCOUNT === undefined || process.env.DEPLOYER_ACCOUNT === "") {
        throw "Please set the environment variables in .env file {DEPLOYER_ACCOUNT}";
    }   
    if (process.env.CONTRACTS_L1BRIDGE_ADDRESS === undefined || process.env.CONTRACTS_L1BRIDGE_ADDRESS === "") {
        throw "Please set the environment variables in .env file {CONTRACTS_L1BRIDGE_ADDRESS}";
    }   
    if (process.env.CONTRACT_RPC_URL_L1 === undefined || process.env.CONTRACT_RPC_URL_L1 === "") {
        throw "Please set the environment variables in .env file {CONTRACT_RPC_URL_L1}";
    }  


    let data1 = { "completed": [] }
    const data2 = fs.readFileSync(path.join('data', 'generate-assets3.json'), "utf-8")
    const assets = JSON.parse(data2)
    const l1Bridge = await ethers.getContractAt("UpgradeL1Bridge", process.env.CONTRACTS_L1BRIDGE_ADDRESS)

    if (data2 == "" || data2 == undefined) {
        console.log("Data not exist")
        process.exit(0)
    }

    const state = await l1Bridge.active()
    const deployer:any = await ethers.provider.getSigner(closer)
    if (state) {
        console.log("Upgraded: Contract is active", state)
    } else {
        console.log("Upgraded: Contract is NotActive", state)
        await l1Bridge.connect(deployer as any).forceActive(true)
    }

    let params = []
    let count = 0;
    let txCount = 0;
    let totalCount = 0;
    const completed: any = []

    console.log("Before Balance")
    for (const assetInfo of assets) {
        if (assetInfo.l1Token === ethers.constants.AddressZero) {
            console.log(assetInfo.tokenName, ": ", await ethers.provider.getBalance(l1Bridge.address));
        } else {
            const l1token = await ethers.getContractAt(ERC20, assetInfo.l1Token)
            console.log(assetInfo.tokenName, ": ", await l1token.balanceOf(l1Bridge.address));
        }
    }
    console.log("\n")
    
    const position = await l1Bridge.positions(0)
    for (const assetInfo of assets) {
        const bar = new ProgressBar(`:bar :current/:total ${assetInfo.tokenName}`, { width: 50, total: assetInfo.data.length });
        // single asset
        for (const asset of assetInfo.data) {
            bar.tick();
            if(asset.amount == 0)
                continue;

        
            await ethers.provider.send('hardhat_impersonateAccount', [asset.claimer])
            await ethers.provider.send('hardhat_impersonateAccount', [asset.claimer])
            await ethers.provider.send('hardhat_setBalance', [asset.claimer, '0x152D02C7E14AF6800000']);
            const signer = await ethers.provider.getSigner(asset.claimer)
            let tx
            try{
                tx = await l1Bridge.connect(signer as any).forceWithdrawClaim(
                    position,
                    asset.hash,
                    assetInfo.l1Token,
                    asset.amount
                )
            }catch(e){
             
            }
            // const receipt = await tx.wait()
            // completed.push(...receipt.events)
            // params.length = 0;
        }
    }
    console.log("Completed Withdraw All Account: MATCH ✅")
    // console.log("Completed Event Count: ", completed.length)

    // const tx = params.length > 0 ? await l1Bridge.connect(forceOwner as any).forceWithdrawClaimAll(params) : undefined
    // if (tx != undefined) {
    //     const receipt = await tx.wait()
    //     completed.push(...receipt.events)
    // }

    // const out: string[] = [];
    // for (const e of completed) {
    //     if (e.event == 'ForceWithdraw') {
    //         out.push(e.args[0])
    //     }
    // }

    // console.log("\nTotal Count: ", totalCount)
    // console.log("Request Count: ", txCount)
    // console.log("Completed Event Count: ", out.length)
    // console.log("Failed Count: ", txCount - out.length)
    // console.log("\nAfter Balance")
    // for (const assetInfo of assets) {
    //     if (assetInfo.l1Token === ethers.constants.AddressZero) {
    //         console.log(assetInfo.tokenName, ": ", await ethers.provider.getBalance(l1Bridge.address));
    //     } else {
    //         const l1token = await ethers.getContractAt(ERC20, assetInfo.l1Token)
    //         console.log(assetInfo.tokenName, ": ", await l1token.balanceOf(l1Bridge.address));
    //     }
    // }
    // console.log("\n")


}

main(10);
