import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { ERC20 } from "../types";
import * as dotenv from 'dotenv'

const deployerSigner = process.env.SEPOLIA_ACCOUNT //  deployer and owner
const deployerAddress = "0x6526728cfDcB07C63CA66fE36b5aA202067eE75b" // deployer and owner

// local or sepolia
const main = async (opt?: boolean) => {
    
    // --local setting
    const proxyDeployer = await ethers.provider.getSigner(0)
    // // console.log("Deployer Address : ", await proxyDeployer.getAddress())
    // // console.log("Deployer Balance : ", await ethers.provider.getBalance(await proxyDeployer.getAddress()))
    
    // const proxyFactory = await ethers.getContractFactory("Proxy");
    // const proxyContract = await proxyFactory.deploy(deployerAddress);

    // const l1BridgeLogic = await (await ethers.getContractFactory("MockL1StandardBridge")).deploy()

    // logic address : 0x65035dcC7C775E61650ae1A2f3E9D665eA139Fb3

    // const owner = "0x37212a8F2abbb40000e974DA82D410DdbecFa956"
    const owner = "0x0000000000000000000000000000000000000000"
    await ethers.provider.send('hardhat_impersonateAccount', [owner])
    await ethers.provider.send('hardhat_setBalance', [owner, '0x152D02C7E14AF6800000']);
    const deployer:any = await ethers.provider.getSigner(owner)

    
    const proxy = await ethers.getContractAt("Proxy", "0x1F032B938125f9bE411801fb127785430E7b3971")
    // const byteCode = await ethers.provider.getCode("0x94aD42A20BD72B673E510594dD5543740aAab24F")
    // console.log('byteCode : ',byteCode)
    // await proxy.setCode(byteCode)
    

    // console.log('L1 implementation : ',await proxy.connect(deployer).getOwner())   
    const a = await proxy.connect(deployer).callStatic.getOwner({})
    console.log(await a)

    // 브릿지 초기화
    // const l1Bridge = await ethers.getContractAt("MockL1StandardBridge", "0x72855Bd554170BcdB9e1e5d04831E767021DA9B9")
    // console.log(await l1Bridge.active())

    // await l1Bridge.initialize("0xd9B1F5081261d3E259F50a53fF0aE693364875F3", "0xd9B1F5081261d3E259F50a53fF0aE693364875F3")
    // console.log(await l1Bridge.l2TokenBridge())

    // token 컨트랙트 배포
    // await L1tokenFactory()
}


const L1tokenFactory = async () => {
    let mockToken;
    // const mockToken = await (await ethers.getContractFactory("MockL1ERC20")).deploy("MockETH","ETH")
    console.log("L1 token address || name || balance")
    mockToken = await (await ethers.getContractFactory("MockL1ERC20")).deploy("Tether USD","USDT",6)
    console.log(mockToken.address," || ", await mockToken.name(), " || ", await mockToken.balanceOf(deployerAddress))
    mockToken = await (await ethers.getContractFactory("MockL1ERC20")).deploy("USD Coin","USDC",6)
    console.log(mockToken.address," || ", await mockToken.name(), " || ", await mockToken.balanceOf(deployerAddress))
    // mockToken = await (await ethers.getContractFactory("MockL1ERC20")).deploy("Tokamak Network","TON")
    // console.log(mockToken.address," || ", await mockToken.name(), " || ", await mockToken.balanceOf(deployerAddress))
    // mockToken = await (await ethers.getContractFactory("MockL1ERC20")).deploy("TONStarter","TOS")
    // console.log(mockToken.address," || ", await mockToken.name(), " || ", await mockToken.balanceOf(deployerAddress))
}


main();
// L1tokenFactory();
