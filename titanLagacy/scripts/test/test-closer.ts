import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { ERC20 } from "../types";
import * as dotenv from 'dotenv'

//closer test
// added only owner function, changed closer variable 
const main = async () => {
    const owner = "0x37212a8F2abbb40000e974DA82D410DdbecFa956"
    await ethers.provider.send('hardhat_impersonateAccount', [owner])
    await ethers.provider.send('hardhat_setBalance', [owner, '0x152D02C7E14AF6800000']);
    const deployer:any = await ethers.provider.getSigner(owner)

    const logic = await (await ethers.getContractFactory("UpgradeL1Bridge")).deploy()


    const proxy = await ethers.getContractAt("Proxy", "0x1F032B938125f9bE411801fb127785430E7b3971")
    const byteCode = await ethers.provider.getCode(logic.address)
    await proxy.connect(deployer).setCode(byteCode)

    console.log("upgrade complete")
    const brdige = await ethers.getContractAt("UpgradeL1Bridge", "0x1F032B938125f9bE411801fb127785430E7b3971")
    console.log(await brdige.closer())

    await brdige.connect(deployer).setCloser("0x1F032B938125f9bE411801fb127785430E7b3971")
    console.log(await brdige.closer())
}

main()