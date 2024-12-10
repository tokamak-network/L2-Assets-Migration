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
        console.log("Please set the environment variables in .env file {DEPLOYER_ACCOUNT}")
        process.exit(0)
    }
    
    // contract deployer
    const deployer = await ethers.provider.getSigner(1)
    const crossContract = await (await ethers.getContractFactory("UpgradeL1CrossDomainMessenger", deployer as any)).deploy()
    console.log("CrossDomainMessenger Address : ", crossContract.address)
    
    try {
        await run("verify:verify", {
          address: crossContract.address,
        });
        console.log("Contract verified successfully!");
    } catch (error) {
        console.error("Verification failed:", error);
    }

}
main();
