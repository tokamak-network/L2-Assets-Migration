import { ethers } from "hardhat";
import * as dotenv from 'dotenv'

// SET VAR
const L1_BRIDGE_ADDRESS = "0xb8B24Eb6b7bA6385d5c317dCD056417A925fC3d8" // deployed L1Brdige contract address, 검증된 브릿지 컨트랙트여야만함

const main = async () => {

    // check environment variables
    if (process.env.DEPLOYER_ACCOUNT === undefined || process.env.DEPLOYER_ACCOUNT === "") {
        throw "Please set the environment variables in .env file {DEPLOYER_ACCOUNT}";
    }   

    const developer:any = await ethers.provider.getSigner(0)
    const proxy = await ethers.getContractAt("Proxy", "0x1F032B938125f9bE411801fb127785430E7b3971") // L1 브릿지 프록시 주소
    const byteCode = await ethers.provider.getCode(L1_BRIDGE_ADDRESS) 
    await proxy.connect(developer).setCode(byteCode)
}

main()

