import { ethers } from "hardhat";   
import * as dotenv from 'dotenv'

const owner = "0xCaD132F770cFBC2B3c512C0FF35c4d9fc37476c9" // l1bridge proxy owner
const path = "live";

export const upgradeL1bridge = async() => {
    if(process.env.CONTRACT_RPC_URL_L1 === undefined || process.env.CONTRACT_RPC_URL_L1 === ""){
        console.log("Please set the environment variables in .env file {CONTRACT_RPC_URL_L1}")
        process.exit(0)
    }
    if(process.env.L1_PORXY_OWNER === undefined || process.env.L1_PORXY_OWNER === ""){
        console.log("Please set the environment variables in .env file {L1_PORXY_OWNER}")
        process.exit(0)
    }
    if(process.env.L1_FORCE_OWNER === undefined || process.env.L1_FORCE_OWNER === ""){
        console.log("Please set the environment variables in .env file {L1_FORCE_OWNER}")
        process.exit(0)
    }
    
    const provider = new ethers.providers.JsonRpcProvider(process.env.CONTRACT_RPC_URL_L1)
    const forceOwner = provider.getSigner(0)
    const proxyOwner = provider.getSigner(1) // L1 proxy deployer
    console.log("proxyDeployer: ", proxyOwner)
    console.log("proxyDeployer: ", forceOwner)

    // const deployer = ethers.provider.getSigner(zeroAddress)
    // const proxy:any = new ethers.Contract(L1BRIDGE, proxyABI.abi);

    // const upgradeContract = await (await ethers.getContractFactory("UpgradeL1BridgeD")).deploy()
    // await upgradeContract.deployed()
    // const byteCode = await ethers.provider.getCode(upgradeContract.address)
    
    // await proxy.connect(deployer).setCode(byteCode)

    // const _owner = await proxy.connect(deployer).callStatic.getOwner()
    // expect(owner).to.be.equal(_owner)

    // const upgradedContract = await ethers.getContractAt("UpgradeL1BridgeD", L1BRIDGE)

    // const _l2Bridge = await upgradedContract.l2TokenBridge()
    // expect(L2BRIDGE).to.be.equal(_l2Bridge)

    // const _messenger = await upgradedContract.messenger()
    // expect(messenger).to.be.equal(_messenger)
}

upgradeL1bridge()