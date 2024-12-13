import { ethers, run } from "hardhat";
const dir = "contracts/data/"


const forking = async () => {
    const owner = "0x37212a8F2abbb40000e974DA82D410DdbecFa956" // sepolia l1brdige proxy owner
    await ethers.provider.send('hardhat_impersonateAccount', [owner])
    await ethers.provider.send('hardhat_setBalance', [owner, '0x152D02C7E14AF6800000']);
    const deployer:any = await ethers.provider.getSigner(owner)
    const proxy = await ethers.getContractAt("Proxy", process.env.CONTRACTS_L1BRIDGE_ADDRESS)
    const l1bridgeABI = require("../../../artifacts/contracts/UpgradeL1Bridge.sol/UpgradeL1Bridge.json");
    await proxy.connect(deployer).setCode(l1bridgeABI.deployedBytecode)
}

export const main = async () => {
    // <-- test account
    await forking()
    const owner = "0x6526728cfDcB07C63CA66fE36b5aA202067eE75b"
    await ethers.provider.send('hardhat_impersonateAccount', [owner])
    await ethers.provider.send('hardhat_setBalance', [owner, '0x152D02C7E14AF6800000']);
    const deployer:any = await ethers.provider.getSigner(owner)
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

main();
