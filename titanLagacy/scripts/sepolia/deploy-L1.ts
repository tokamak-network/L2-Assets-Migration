import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { ERC20 } from "../types";
import * as dotenv from 'dotenv'

const deployerSigner = process.env.SEPOLIA_ACCOUNT //  deployer and owner
const deployerAddress = "0x6526728cfDcB07C63CA66fE36b5aA202067eE75b" // deployer and owner

// local or sepolia
const main = async (opt?: boolean) => {
    
    // --local setting
    const proxyDeployer = await ethers.provider.getSigner(deployerAddress)
    // // console.log("Deployer Address : ", await proxyDeployer.getAddress())
    // // console.log("Deployer Balance : ", await ethers.provider.getBalance(await proxyDeployer.getAddress()))
    
    // const proxyFactory = await ethers.getContractFactory("Proxy");
    // const proxyContract = await proxyFactory.deploy(deployerAddress);

    // const l1BridgeLogic = await (await ethers.getContractFactory("MockL1StandardBridge")).deploy()

    // logic address : 0x65035dcC7C775E61650ae1A2f3E9D665eA139Fb3
    // const proxy = await ethers.getContractAt("Proxy", "0x72855Bd554170BcdB9e1e5d04831E767021DA9B9")
    // const byteCode = await ethers.provider.getCode("0x65035dcC7C775E61650ae1A2f3E9D665eA139Fb3")
    // await proxy.setCode(byteCode)
    // await proxy.getImplementation()

    // console.log('L1 Proxy : ',proxyContract.address)
    // console.log('L1 Logic : ',l1BridgeLogic.address)   

    // 브릿지 초기화
    const l1Bridge = await ethers.getContractAt("MockL1StandardBridge", "0x72855Bd554170BcdB9e1e5d04831E767021DA9B9")
    console.log(await l1Bridge.active())

    // await l1Bridge.initialize("0xd9B1F5081261d3E259F50a53fF0aE693364875F3", "0xd9B1F5081261d3E259F50a53fF0aE693364875F3")
    // console.log(await l1Bridge.l2TokenBridge())

    // token 컨트랙트 배포
    // await L1tokenFactory()
}


const L1tokenFactory = async () => {
    let mockToken;
    // const mockToken = await (await ethers.getContractFactory("MockL1ERC20")).deploy("MockETH","ETH")
    console.log("L1 token address || name || balance")
    mockToken = await (await ethers.getContractFactory("MockL1ERC20")).deploy("MockUSDT","USDT")
    console.log(mockToken.address," || ", await mockToken.name(), " || ", await mockToken.balanceOf(deployerAddress))
    // mockToken = await (await ethers.getContractFactory("MockL1ERC20")).deploy("MockUSDC","USDC")
    // console.log(mockToken.address," || ", await mockToken.name(), " || ", await mockToken.balanceOf(deployerAddress))
    // mockToken = await (await ethers.getContractFactory("MockL1ERC20")).deploy("MockTON","TON")
    // console.log(mockToken.address," || ", await mockToken.name(), " || ", await mockToken.balanceOf(deployerAddress))
    // mockToken = await (await ethers.getContractFactory("MockL1ERC20")).deploy("MockTOS","TOS")
    // console.log(mockToken.address," || ", await mockToken.name(), " || ", await mockToken.balanceOf(deployerAddress))
}


main();
// L1tokenFactory();
