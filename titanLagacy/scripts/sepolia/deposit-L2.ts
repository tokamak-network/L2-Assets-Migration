import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { ERC20 } from "../types";
import * as dotenv from 'dotenv'

const deployerSigner = process.env.SEPOLIA_ACCOUNT //  deployer and owner
const deployerAddress = "0x6526728cfDcB07C63CA66fE36b5aA202067eE75b" // deployer and owner

// test account1 0xe6BDAB42d78C635502f5ef5707Ac1e4524C1E9A9, d43303aa2b8af829f99ab1df5ee89f01e4f24a18c8b29deff32085f8ae67fb01
// test account2 0x90F281ccEDD4366c8cCA81d2ba3D54A808Baa806, 1a922902d307ca05ba8d29f97272647963d1f9a5ebe0c51830a9ec3a983a4d6c

const test_acc1 = "0xe6BDAB42d78C635502f5ef5707Ac1e4524C1E9A9";
const test_acc2 = "0x90F281ccEDD4366c8cCA81d2ba3D54A808Baa806";

// local or sepolia
const mint = async (opt?: boolean) => {

    // --local setting
    // const siger_deployer = await ethers.provider.getSigner(0)
    // const signer_acc1 = await ethers.provider.getSigner(1)
    // const signer_acc2 = await ethers.provider.getSigner(2)
    // console.log("Deployer Address : ", await signer_acc1.getAddress())
    // console.log("Deployer Address2 : ", await signer_acc2.getAddress())

    // // mint mock token 1,000,000 amount
    // const l1Usdt = await ethers.getContractAt("MockL1ERC20", "0x093144B5e482D664B1cCC1eA4913aC29000a0B90") // USDT 18 decimal origin 6
    // const l1Usdc = await ethers.getContractAt("MockL1ERC20", "0x28Cb7d05153CA96AaB7B39150155cc4921CE83A3") // USDC 18 decimal origin 6
    // const l1Ton = await ethers.getContractAt("MockL1ERC20", "0xe7070AE4d3506dC9b772d714b6c427658D45c03e") // TON 18 decimal
    // const l1Tos = await ethers.getContractAt("MockL1ERC20", "0x728eE535E5042fA15bCaE482c4DD35983C9b07aD") // TOS 18 decimal

    // await l1Usdt.connect(siger_deployer).mint(test_acc1, ethers.utils.parseUnits("1000000", 18)) 
    // await l1Usdc.connect(siger_deployer).mint(test_acc1, ethers.utils.parseUnits("1000000", 18)) 
    // await l1Ton.connect(siger_deployer).mint(test_acc1, ethers.utils.parseUnits("1000000", 18)) 
    // await l1Tos.connect(siger_deployer).mint(test_acc1, ethers.utils.parseUnits("1000000", 18)) 

    // await l1Usdt.connect(siger_deployer).mint(test_acc2, ethers.utils.parseUnits("1000000", 18)) 
    // await l1Usdc.connect(siger_deployer).mint(test_acc2, ethers.utils.parseUnits("1000000", 18)) 
    // await l1Ton.connect(siger_deployer).mint(test_acc2, ethers.utils.parseUnits("1000000", 18)) 
    // await l1Tos.connect(siger_deployer).mint(test_acc2, ethers.utils.parseUnits("1000000", 18)) 

    
}

// function finalizeDeposit(
//     address _l1Token,
//     address _l2Token,
//     address _from,
//     address _to,
//     uint256 _amount,
//     bytes calldata _data
// ) external virtual {

// L1 계정 전송한 이후에 작업
const finalized = async () => {
    const deployer = await ethers.provider.getSigner(0)
    const signer_acc1 = await ethers.provider.getSigner(1)
    const signer_acc2 = await ethers.provider.getSigner(2)

    const l1Bridge = await ethers.getContractAt("MockL2StandardBridge", "0xd9B1F5081261d3E259F50a53fF0aE693364875F3")

    const l1Usdt = await ethers.getContractAt("MockL2StandardERC20", "0x72855Bd554170BcdB9e1e5d04831E767021DA9B9") // USDT 18 decimal origin 6
    const l1Usdc = await ethers.getContractAt("MockL2StandardERC20", "0x65035dcC7C775E61650ae1A2f3E9D665eA139Fb3") // USDC 18 decimal origin 6
    const l1Ton = await ethers.getContractAt("MockL2StandardERC20", "0xc24218a29F65aDBF237ED5b1B9D8802d07D75C9E") // TON 18 decimal
    const l1Tos = await ethers.getContractAt("MockL2StandardERC20", "0x4B014c77f1A38204d97d6fCBAb127ee79dbFE907") // TOS 18 decimal

    await l1Bridge.connect(deployer as any).finalizeDeposit(
        "0x093144B5e482D664B1cCC1eA4913aC29000a0B90",
        "0x72855Bd554170BcdB9e1e5d04831E767021DA9B9",
        await signer_acc1.getAddress(),
        await signer_acc1.getAddress(),
        ethers.utils.parseUnits("112", 18),
        "0x"
    )

    await l1Bridge.connect(deployer as any).finalizeDeposit(
        "0x28Cb7d05153CA96AaB7B39150155cc4921CE83A3",
        "0x65035dcC7C775E61650ae1A2f3E9D665eA139Fb3",
        await signer_acc1.getAddress(),
        await signer_acc1.getAddress(),
        ethers.utils.parseUnits("114", 18),
        "0x"
    )

    await l1Bridge.connect(deployer as any).finalizeDeposit(
        "0x093144B5e482D664B1cCC1eA4913aC29000a0B90",
        "0x72855Bd554170BcdB9e1e5d04831E767021DA9B9",
        await signer_acc2.getAddress(),
        await signer_acc2.getAddress(),
        ethers.utils.parseUnits("90", 18),
        "0x"

    )

    await l1Bridge.connect(deployer as any).finalizeDeposit(
        "0x28Cb7d05153CA96AaB7B39150155cc4921CE83A3",
        "0x65035dcC7C775E61650ae1A2f3E9D665eA139Fb3",
        await signer_acc2.getAddress(),
        await signer_acc2.getAddress(),
        ethers.utils.parseUnits("11", 18),
        "0x"
    )


}


// mint();
finalized();
