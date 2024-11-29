import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { ERC20 } from "../types";
import * as dotenv from 'dotenv'

const deployerSigner = process.env.SEPOLIA_ACCOUNT //  deployer and owner
const deployerAddress = "0x6526728cfDcB07C63CA66fE36b5aA202067eE75b" // deployer and owner

// 배포전에 반드시 check
const CrossDomainAddress = "0x72855Bd554170BcdB9e1e5d04831E767021DA9B9";
const L1BridgeAddress = "0x72855Bd554170BcdB9e1e5d04831E767021DA9B9"; // L1 브릿지 주소

// local or sepolia
const main = async (opt?: boolean) => {
    
    // --local setting
    // const proxyDeployer = await ethers.provider.getSigner(deployerAddress)
    // console.log("Deployer Address : ", await proxyDeployer.getAddress())
    // console.log("Deployer Balance : ", await ethers.provider.getBalance(await proxyDeployer.getAddress()))
    
    // L2 브릿지 배포
    
    const l2BridgeContract = await (await ethers.getContractFactory("MockL2StandardBridge")).deploy(CrossDomainAddress,L1BridgeAddress)
    
    console.log("L2 Bridge address-> ",l2BridgeContract.address)
    console.log("L1 Bridge address-> ", await l2BridgeContract.l1TokenBridge())


    // L2 토큰 배포
    // await L2tokenFactory()
}

// address _l2Bridge,
// address _l1Token,
// string memory _name,
// string memory _symbol
const l2BridgeAddress =  "0xd9B1F5081261d3E259F50a53fF0aE693364875F3";
const L2tokenFactory = async () => {
    let mockToken;
    // const mockToken = await (await ethers.getContractFactory("MockL1ERC20")).deploy("MockETH","ETH")
    
    console.log("L2 token address || name || balance")
    //  l2브릿지 주소, l1토큰 주소, 이름, 심볼 
    mockToken = await (await ethers.getContractFactory("MockL2StandardERC20")).deploy(l2BridgeAddress,"0x093144B5e482D664B1cCC1eA4913aC29000a0B90","MockUSDT","USDT")
    console.log(mockToken.address," || ", await mockToken.name(), " || ", await mockToken.balanceOf(deployerAddress))
    mockToken = await (await ethers.getContractFactory("MockL2StandardERC20")).deploy(l2BridgeAddress,"0x28Cb7d05153CA96AaB7B39150155cc4921CE83A3","MockUSDC","USDC")
    console.log(mockToken.address," || ", await mockToken.name(), " || ", await mockToken.balanceOf(deployerAddress))
    mockToken = await (await ethers.getContractFactory("MockL2StandardERC20")).deploy(l2BridgeAddress,"0xe7070AE4d3506dC9b772d714b6c427658D45c03e","MockTON","TON")
    console.log(mockToken.address," || ", await mockToken.name(), " || ", await mockToken.balanceOf(deployerAddress))
    mockToken = await (await ethers.getContractFactory("MockL2StandardERC20")).deploy(l2BridgeAddress,"0x728eE535E5042fA15bCaE482c4DD35983C9b07aD","MockTOS","TOS")
    console.log(mockToken.address," || ", await mockToken.name(), " || ", await mockToken.balanceOf(deployerAddress))
}


// main();
L2tokenFactory();
