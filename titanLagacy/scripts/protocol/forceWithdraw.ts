import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { ERC20 } from "../types";
import fs from 'fs'
import path from 'path'
import ProgressBar from 'progress';

const forkProxyOwner: string = "0xCaD132F770cFBC2B3c512C0FF35c4d9fc37476c9" // sepolia l1bridge proxy owner
const forkForceOwner: string = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" // sepolia l1bridge force owner

const upgradeABI = require("../../artifacts/contracts/UpgradeL1Bridge.sol/UpgradeL1Bridge.json")
const proxyABI = require("../../artifacts/contracts/Proxy.sol/Proxy.json")
const dirPath: string = "data"

const checkEnv = () => {
    if (process.env.CONTRACT_RPC_URL_L1 === undefined || process.env.CONTRACT_RPC_URL_L1 === "") {
        console.log("Please set the environment variables in .env file {CONTRACT_RPC_URL_L1}")
        process.exit(0)
    }
    if (process.env.L1_PORXY_OWNER === undefined || process.env.L1_PORXY_OWNER === "") {
        console.log("Please set the environment variables in .env file {L1_PORXY_OWNER}")
        process.exit(0)
    }
    if (process.env.L1_FORCE_OWNER === undefined || process.env.L1_FORCE_OWNER === "") {
        console.log("Please set the environment variables in .env file {L1_FORCE_OWNER}")
        process.exit(0)
    }
    if (process.env.L1_FORCE_OWNER === undefined || process.env.L1_FORCE_OWNER === "") {
        console.log("Please set the environment variables in .env file {L1_FORCE_OWNER}")
        process.exit(0)
    }
    if (process.env.CONTRACTS_L1BRIDGE_ADDRESS === undefined || process.env.CONTRACTS_L1BRIDGE_ADDRESS === "") {
        console.log("Please set the environment variables in .env file {CONTRACTS_L1BRIDGE_ADDRESS}")
        process.exit(0)
    }
}

export const upgradeL1bridge = async (opt?: boolean) => {
    checkEnv()
    /* test suits sepolia */
    opt ? console.log("Mainnet Mode") : await ethers.provider.send('hardhat_impersonateAccount', [forkProxyOwner])
    opt ? "" : await ethers.provider.send('hardhat_setBalance', [forkProxyOwner, '0x152D02C7E14AF6800000']);
    const proxyOwner = opt ? await ethers.provider.getSigner(process.env.L1_PORXY_OWNER) : await ethers.provider.getSigner(forkProxyOwner)
    /* test suits sepolia */

    // const proxyOwner =  // L1 proxy deployer
    const proxy: any = new ethers.Contract(process.env.CONTRACTS_L1BRIDGE_ADDRESS!, proxyABI.abi);
    let _owner = await proxy.connect(proxyOwner).callStatic.getOwner()

    if (_owner != await proxyOwner.getAddress()) {
        console.log("Owner is not the same")
        process.exit(0)
    }
    const result: any = await getGas()
    if (result == undefined) {
        console.log("Gas is not defined")
        process.exit(0)
    }

    const upgradeContract = await (await ethers.getContractFactory(upgradeABI.abi, upgradeABI.bytecode, proxyOwner as any)).deploy({
        maxFeePerGas: result[0],
        maxPriorityFeePerGas: result[1]
    })

    const byteCode = await ethers.provider.getCode(upgradeContract.address)
    await proxy.connect(proxyOwner).setCode(byteCode)

    _owner = await proxy.connect(proxyOwner).callStatic.getOwner()
    if (_owner != await proxyOwner.getAddress()) {
        console.log("Owner is not the same")
        process.exit(0)
    }
    const upgradedContract = await ethers.getContractAt(upgradeABI.abi, process.env.CONTRACTS_L1BRIDGE_ADDRESS)
    try {
        const _l2Bridge = await upgradedContract.l2TokenBridge()
        console.log("L2 Bridge Address : ", _l2Bridge)
        const _messenger = await upgradedContract.messenger()
        console.log("L2 CrossDomain Address", _messenger)
    } catch (e) {
        console.log("Upgraded Error(l2Bridge()): ", e)
        process.exit(0)
    }

    try {
        const state = await upgradedContract.active()
        if (state) {
            console.log("Upgraded: Contract is active", state)
        } else {
            console.log("Upgraded: Contract is NotActive", state)
        }
    } catch (e) {
        console.log("Upgraded Error(active()): ", e)
        process.exit(0)
    }
}

// 업그레이드 절차 
// 

// cross domain upgrade
export const UpgradeL1CrossDomainMessenger = async (opt?: boolean) => {
    /* test suits sepolia */
    opt ? console.log("Mainnet Mode") : await ethers.provider.send('hardhat_impersonateAccount', [forkForceOwner])
    opt ? "" : await ethers.provider.send('hardhat_setBalance', [forkForceOwner, '0x152D02C7E14AF6800000'])
    const forceOwner = opt ? await ethers.provider.getSigner(1) : await ethers.provider.getSigner(forkForceOwner)
    /* test suits sepolia */






}






export const sendForceWithdraw = async (max: number, opt?: boolean) => {
    /* test suits sepolia */
    opt ? console.log("Mainnet Mode") : await ethers.provider.send('hardhat_impersonateAccount', [forkForceOwner])
    opt ? "" : await ethers.provider.send('hardhat_setBalance', [forkForceOwner, '0x152D02C7E14AF6800000'])
    const forceOwner = opt ? await ethers.provider.getSigner(1) : await ethers.provider.getSigner(forkForceOwner)
    /* test suits sepolia */

    checkEnv()
    let originSave;
    let data1;

    fs.mkdir(dirPath, { recursive: true }, (err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
    });

    try {
        data1 = JSON.parse(fs.readFileSync(path.join(dirPath, 'generate-completed.json'), 'utf-8'))
        originSave = data1.completed.reduce((acc: any, val: any) => {
            acc.set(val, true)
            return acc;
        }, new Map<string, boolean>())
    } catch (e) {
        originSave = new Map<string, boolean>()
        data1 = { "completed": [] }
    }

    const data2 = fs.readFileSync(path.join('data', 'generate-assets3.json'), "utf-8")
    const assets = JSON.parse(data2)
    const l1Bridge = await ethers.getContractAt(upgradeABI.abi, process.env.CONTRACTS_L1BRIDGE_ADDRESS)

    if (data2 == "" || data2 == undefined) {
        console.log("Data not exist")
        process.exit(0)
    }

    const state = await l1Bridge.active()
    if (state) {
        console.log("Upgraded: Contract is active", state)
    } else {
        console.log("Upgraded: Contract is NotActive", state)
        await l1Bridge.connect(forceOwner as any).forceActive(true)
    }

    let params = []
    let count = 0;
    const completed: any = []
    let txCount = 0;
    let totalCount = 0;

    console.log("Before Balance")
    for (const assetInfo of assets) {
        if (assetInfo.l1Token === ethers.constants.AddressZero) {
            console.log(assetInfo.tokenName, ": ", await ethers.provider.getBalance(l1Bridge.address));
        } else {
            const l1token = await ethers.getContractAt(ERC20, assetInfo.l1Token)
            console.log(assetInfo.tokenName, ": ", await l1token.balanceOf(l1Bridge.address));
        }
    }


    for (const assetInfo of assets) {
        let total = BigNumber.from(0)
        const bar = new ProgressBar(`:bar :current/:total ${assetInfo.tokenName}`, { width: 50, total: assetInfo.data.length });

        for (const asset of assetInfo.data) {
            if (count != max) {
                if (asset.amount == 0 || originSave.has(asset.hash)) {
                    totalCount++;
                    continue;
                } else {
                    params.push({
                        token: assetInfo.l1Token,
                        to: asset.claimer,
                        amount: asset.amount,
                        index: asset.hash
                    })
                    count++;
                    txCount++;
                    totalCount++;
                }
            }

            if (count == max) {
                const tx = await l1Bridge.connect(forceOwner as any).forceWithdrawAll(params)
                const receipt = await tx.wait()
                completed.push(...receipt.events)
                params.length = 0;
                count = 0;
            }
            bar.tick();
            // total = total.add(asset.amount)  
        }
    }

    const tx = params.length > 0 ? await l1Bridge.connect(forceOwner as any).forceWithdrawAll(params) : undefined
    if (tx != undefined) {
        const receipt = await tx.wait()
        console.log(receipt.events)
        completed.push(...receipt.events)
    }

    const out: string[] = [];
    for (const e of completed) {
        if (e.event == 'ForceWithdraw') {
            out.push(e.args[0])
        }

    }


    console.log("\nTotal Count: ", totalCount)
    console.log("Request Count: ", txCount)
    console.log("Completed Event Count: ", out.length)
    console.log("Failed Count: ", txCount - out.length)
    console.log("\nAfter Balance")
    for (const assetInfo of assets) {
        if (assetInfo.l1Token === ethers.constants.AddressZero) {
            console.log(assetInfo.tokenName, ": ", await ethers.provider.getBalance(l1Bridge.address));
        } else {
            const l1token = await ethers.getContractAt(ERC20, assetInfo.l1Token)
            console.log(assetInfo.tokenName, ": ", await l1token.balanceOf(l1Bridge.address));
        }
    }
    console.log("\n")

    data1.completed.push(...out)
    fs.writeFileSync(path.join(dirPath, 'generate-completed.json'), JSON.stringify({ "completed": data1.completed }, null, 1), 'utf-8')
}

export const pause = async (opt?: boolean) => {
    checkEnv()
    /* test suits sepolia */
    opt ? console.log("Mainnet Mode") : await ethers.provider.send('hardhat_impersonateAccount', [forkForceOwner])
    opt ? "" : await ethers.provider.send('hardhat_setBalance', [forkForceOwner, '0x152D02C7E14AF6800000'])
    const forceOwner = opt ? await ethers.provider.getSigner(1) : await ethers.provider.getSigner(forkForceOwner)
    /* test suits sepolia */

    const l1Bridge = await ethers.getContractAt(upgradeABI.abi, process.env.CONTRACTS_L1BRIDGE_ADDRESS)
    await l1Bridge.connect(forceOwner as any).forceActive(true)
    console.log("Force Protocol Paused")
}

const getGas = async () => {
    const blockNumber = process.env.L1_END_BLOCK || "latest"
    const block = await ethers.provider.getBlock(blockNumber)
    const baseFee = block.baseFeePerGas

    if (baseFee == undefined) {
        console.log("BaseFee is not defined")
        return undefined
    } else {
        const priorityFee = ethers.utils.parseUnits("2", "gwei");
        return baseFee.mul(2).add(priorityFee), priorityFee;
    }
}


// const main = async () => {
//     await upgradeL1bridge()
//     await sendForceWithdraw(1)
// }
// main()