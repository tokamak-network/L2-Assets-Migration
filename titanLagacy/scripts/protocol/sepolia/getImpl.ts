import { ethers, run } from "hardhat";
import * as dotenv from 'dotenv'

const main = async () => {
    // test account
    const owner = "0x37212a8F2abbb40000e974DA82D410DdbecFa956"
    await ethers.provider.send('hardhat_impersonateAccount', [owner])
    await ethers.provider.send('hardhat_setBalance', [owner, '0x152D02C7E14AF6800000']);
    const deployer:any = await ethers.provider.getSigner(owner)

    const proxy = await ethers.getContractAt("Proxy", process.env.CONTRACTS_L1BRIDGE_ADDRESS)
    console.log("impl : -> ",await proxy.connect(deployer).callStatic.getImplementation() )

}

main();
