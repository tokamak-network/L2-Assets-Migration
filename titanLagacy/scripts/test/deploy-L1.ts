import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { ERC20 } from "../types";
import * as dotenv from 'dotenv'

const deployerSigner = process.env.SEPOLIA_ACCOUNT //  deployer and owner
const deployerAddress = "0x6526728cfDcB07C63CA66fE36b5aA202067eE75b" // deployer and owner

// local or sepolia
const main = async (opt?: boolean) => {
    
    // --local setting
    const developer:any = await ethers.provider.getSigner(1)
    console.log(await developer.getAddress())

    // const l1BridgeLogic = await (await ethers.getContractFactory("UpgradeL1Bridge", developer)).deploy()
    // console.log("l1 bridgeLogic : ", l1BridgeLogic.address)
    
    const proxy = await ethers.getContractAt("Proxy", "0x72855Bd554170BcdB9e1e5d04831E767021DA9B9") // 
    const byteCode = await ethers.provider.getCode("0xb8B24Eb6b7bA6385d5c317dCD056417A925fC3d8") // 배포되고 검증된 브릿지 컨트랙트
    // console.log('byteCode : ',byteCode)
    // await proxy.setCode(byteCode)
    

    // console.log('L1 implementation : ',await proxy.connect(deployer).getOwner())   
    // const a = await proxy.connect(deployer).callStatic.getOwner({})
    // console.log(await a)

    // 브릿지 초기화
    // const l1Bridge = await ethers.getContractAt("MockL1StandardBridge", "0x72855Bd554170BcdB9e1e5d04831E767021DA9B9")
    // console.log(await l1Bridge.active())

    // await l1Bridge.initialize("0xd9B1F5081261d3E259F50a53fF0aE693364875F3", "0xd9B1F5081261d3E259F50a53fF0aE693364875F3")
    // console.log(await l1Bridge.l2TokenBridge())

    // token 컨트랙트 배포
    // await L1tokenFactory()
}

// set code 
const main2 = async () => {
    const developer:any = await ethers.provider.getSigner(1)
    const proxy = await ethers.getContractAt("Proxy", "0x72855Bd554170BcdB9e1e5d04831E767021DA9B9") // 브릿지 프록시
    const byteCode = await ethers.provider.getCode("0xb8B24Eb6b7bA6385d5c317dCD056417A925fC3d8") // 배포되고 검증된 브릿지 컨트랙트여야만함
    await proxy.connect(developer).setCode(byteCode)

}

// main();
main2();

