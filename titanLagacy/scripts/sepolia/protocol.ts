import { ethers } from "hardhat";

const deployerSigner = process.env.SEPOLIA_ACCOUNT //  deployer and owner
const deployerAddress = "0x6526728cfDcB07C63CA66fE36b5aA202067eE75b" // deployer and owner

const RegistryStorage = async (opt?: boolean) => {
    const deployer:any = await ethers.provider.getSigner(0)

    // const fwStorage = require("../../artifacts/contracts/data/sepolia/GenFWStorage1.sol/GenFWStorage1.json");

    // const storageContract = await (await ethers.getContractFactory(
    //         fwStorage.abi,
    //         fwStorage.bytecode,
    //         deployer as any
    //     )
    // ).deploy()
    
    // const storageAddress = (await storageContract.deployed()).address
    // const deployedContact = [] 
    // deployedContact.push(storageAddress)

    
    const l1Bridge = await ethers.getContractAt("MockL1StandardBridge", "0x72855Bd554170BcdB9e1e5d04831E767021DA9B9")
    // await l1Bridge.connect(deployer).forceRegistry(["0x0dd3e5e89AD43A2E5E2e511B218524F294c38970"])

    console.log(await l1Bridge.positions(0))
    console.log(await l1Bridge.position("0x0dd3e5e89AD43A2E5E2e511B218524F294c38970"))
    
}

RegistryStorage();

