import { ethers } from "hardhat";

const main = async () => {
    // check environment variables
    if (process.env.DEPLOYER_ACCOUNT === undefined || process.env.DEPLOYER_ACCOUNT === "") {
        throw "Please set the environment variables in .env file {DEPLOYER_ACCOUNT}";
    }   

    const developer:any = await ethers.provider.getSigner(0)
    console.log("Deployer address : ", await developer.getAddress())

    const l1BridgeLogic = await (await ethers.getContractFactory("UpgradeL1Bridge", developer)).deploy()
    console.log("L1 Bridge Logic Address : ", l1BridgeLogic.address)
};

main();


