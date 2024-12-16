import { ethers, run } from "hardhat";
import * as dotenv from 'dotenv'

const main = async () => {
    
    // test account
    // const owner = "0x0000000000000000000000000000000000000000"
    // await ethers.provider.send('hardhat_impersonateAccount', [owner])
    // await ethers.provider.send('hardhat_setBalance', [owner, '0x152D02C7E14AF6800000']);
    // const deployer:any = await ethers.provider.getSigner(owner)

    // check environment variables
    if (process.env.DEPLOYER_ACCOUNT === undefined || process.env.DEPLOYER_ACCOUNT === "") {
        throw "Please set the environment variables in .env file {DEPLOYER_ACCOUNT}";
    }
    
    // contract deployer
    const deployer = await ethers.provider.getSigner(0)
    const crossContract = await (await ethers.getContractFactory("UpgradeL1CrossDomainMessenger", deployer as any)).deploy()
    console.log("CrossDomainMessenger Address : ", crossContract.address)

}

main();
