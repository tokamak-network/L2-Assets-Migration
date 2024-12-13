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
    const siger_deployer = await ethers.provider.getSigner(0)
    const signer_acc1 = await ethers.provider.getSigner(1)
    const signer_acc2 = await ethers.provider.getSigner(2)
    console.log("Deployer Address : ", await signer_acc1.getAddress())
    console.log("Deployer Address2 : ", await signer_acc2.getAddress())

    // mint mock token 1,000,000 amount
    const l1Usdt = await ethers.getContractAt("MockL1ERC20", "0x093144B5e482D664B1cCC1eA4913aC29000a0B90") // USDT 18 decimal origin 6
    const l1Usdc = await ethers.getContractAt("MockL1ERC20", "0x28Cb7d05153CA96AaB7B39150155cc4921CE83A3") // USDC 18 decimal origin 6
    const l1Ton = await ethers.getContractAt("MockL1ERC20", "0xe7070AE4d3506dC9b772d714b6c427658D45c03e") // TON 18 decimal
    const l1Tos = await ethers.getContractAt("MockL1ERC20", "0x728eE535E5042fA15bCaE482c4DD35983C9b07aD") // TOS 18 decimal

    // await l1Usdt.connect(siger_deployer).mint(test_acc1, ethers.utils.parseUnits("1000000", 18)) 
    // await l1Usdc.connect(siger_deployer).mint(test_acc1, ethers.utils.parseUnits("1000000", 18)) 
    // await l1Ton.connect(siger_deployer).mint(test_acc1, ethers.utils.parseUnits("1000000", 18)) 
    // await l1Tos.connect(siger_deployer).mint(test_acc1, ethers.utils.parseUnits("1000000", 18)) 

    // await l1Usdt.connect(siger_deployer).mint(test_acc2, ethers.utils.parseUnits("1000000", 18)) 
    // await l1Usdc.connect(siger_deployer).mint(test_acc2, ethers.utils.parseUnits("1000000", 18)) 
    // await l1Ton.connect(siger_deployer).mint(test_acc2, ethers.utils.parseUnits("1000000", 18)) 
    // await l1Tos.connect(siger_deployer).mint(test_acc2, ethers.utils.parseUnits("1000000", 18)) 

    
}

// function depositERC20(
//     address _l1Token,
//     address _l2Token,
//     uint256 _amount,
//     uint32 _l2Gas,
//     bytes calldata _data

// L1 ETH 전송해줘야 2계정 전부
const deposit = async () => {
    const signer_acc1 = await ethers.provider.getSigner(1)
    const signer_acc2 = await ethers.provider.getSigner(2)

    const l1Bridge = await ethers.getContractAt("MockL1StandardBridge", "0x72855Bd554170BcdB9e1e5d04831E767021DA9B9")
    
    const l1Usdt = await ethers.getContractAt("MockL1ERC20", "0xE83D8Bc8b7Bfd211d1848d5eE749D9c635d30bE6") // USDT 18 decimal origin 6
    const l1Usdc = await ethers.getContractAt("MockL1ERC20", "0x416cFF32947E2b42Fa70f972B18bffFC7239c456") // USDC 18 decimal origin 6
    const l1Ton = await ethers.getContractAt("MockL1ERC20", "0xe7070AE4d3506dC9b772d714b6c427658D45c03e") // TON 18 decimal
    const l1Tos = await ethers.getContractAt("MockL1ERC20", "0x728eE535E5042fA15bCaE482c4DD35983C9b07aD") // TOS 18 decimal

    // await l1Ton.mint("0x72855Bd554170BcdB9e1e5d04831E767021DA9B9", ethers.utils.parseUnits("99999999999", 18))
    // await l1Tos.mint("0x72855Bd554170BcdB9e1e5d04831E767021DA9B9", ethers.utils.parseUnits("99999999999", 18))

    console.log(await l1Ton.balanceOf("0x72855Bd554170BcdB9e1e5d04831E767021DA9B9"))

    // await l1Usdt.connect(signer_acc1).approve("0x72855Bd554170BcdB9e1e5d04831E767021DA9B9", ethers.utils.parseUnits("1000000", 18))
    // await l1Usdc.connect(signer_acc1).approve("0x72855Bd554170BcdB9e1e5d04831E767021DA9B9", ethers.utils.parseUnits("1000000", 18))
    // await l1Ton.connect(signer_acc1).approve("0x72855Bd554170BcdB9e1e5d04831E767021DA9B9", ethers.utils.parseUnits("1000000", 18))
    // await l1Tos.connect(signer_acc1).approve("0x72855Bd554170BcdB9e1e5d04831E767021DA9B9", ethers.utils.parseUnits("1000000", 18))

    // await l1Usdt.connect(signer_acc2).approve("0x72855Bd554170BcdB9e1e5d04831E767021DA9B9", ethers.utils.parseUnits("1000000", 18))
    // await l1Usdc.connect(signer_acc2).approve("0x72855Bd554170BcdB9e1e5d04831E767021DA9B9", ethers.utils.parseUnits("1000000", 18))
    // await l1Ton.connect(signer_acc2).approve("0x72855Bd554170BcdB9e1e5d04831E767021DA9B9", ethers.utils.parseUnits("1000000", 18))
    // await l1Tos.connect(signer_acc2).approve("0x72855Bd554170BcdB9e1e5d04831E767021DA9B9", ethers.utils.parseUnits("1000000", 18))

    // await l1Bridge.connect(signer_acc1).depositERC20(
    //     "0x093144B5e482D664B1cCC1eA4913aC29000a0B90",
    //     "0x72855Bd554170BcdB9e1e5d04831E767021DA9B9",
    //     ethers.utils.parseUnits("112", 18),
    //     0, 
    //     "0x"
    // )

    // await l1Bridge.connect(signer_acc1).depositERC20(
    //     "0x28Cb7d05153CA96AaB7B39150155cc4921CE83A3",
    //     "0x65035dcC7C775E61650ae1A2f3E9D665eA139Fb3",
    //     ethers.utils.parseUnits("114", 18),
    //     0,
    //     "0x"
    // )

    // await l1Bridge.connect(signer_acc2).depositERC20(
    //     "0x093144B5e482D664B1cCC1eA4913aC29000a0B90",
    //     "0x72855Bd554170BcdB9e1e5d04831E767021DA9B9",
    //     ethers.utils.parseUnits("90", 18),
    //     0,
    //     "0x"

    // )

    // await l1Bridge.connect(signer_acc2).depositERC20(
    //     "0x28Cb7d05153CA96AaB7B39150155cc4921CE83A3",
    //     "0x65035dcC7C775E61650ae1A2f3E9D665eA139Fb3",
    //     ethers.utils.parseUnits("11", 18),
    //     0,
    //     "0x"
    // )


}

const depositMainnet = async () => {
    // test account
    // const owner = process.env.CLOSER_ADDRESS;
    // await ethers.provider.send('hardhat_impersonateAccount', [owner])
    // await ethers.provider.send('hardhat_setBalance', [owner, '0x152D02C7E14AF6800000']);
    // const deployer:any = await ethers.provider.getSigner(owner)

    const l1Bridge = await ethers.getContractAt("UpgradeL1Bridge", "0x1F032B938125f9bE411801fb127785430E7b3971")
    const ton = await ethers.getContractAt("MockL1ERC20", "0xa30fe40285B8f5c0457DbC3B7C8A280373c40044") // TON
    const tos = await ethers.getContractAt("MockL1ERC20", "0xFF3Ef745D9878AfE5934Ff0b130868AFDDbc58e8") // TOS

    // await ton.approve("0x1F032B938125f9bE411801fb127785430E7b3971", ethers.utils.parseUnits("1000000", 18))
    // await tos.approve("0x1F032B938125f9bE411801fb127785430E7b3971", ethers.utils.parseUnits("1000000", 18))

    // //TON
    // await l1Bridge.depositERC20(
    //     "0x093144B5e482D664B1cCC1eA4913aC29000a0B90",
    //     "0x72855Bd554170BcdB9e1e5d04831E767021DA9B9",
    //     ethers.utils.parseUnits("112", 18),
    //     0, 
    //     "0x"
    // )
 

    // // TOS
    // await l1Bridge.depositERC20(
    //     "0x093144B5e482D664B1cCC1eA4913aC29000a0B90",
    //     "0x72855Bd554170BcdB9e1e5d04831E767021DA9B9",
    //     ethers.utils.parseUnits("112", 18),
    //     0, 
    //     "0x"
    // )

    // ETH
    await l1Bridge.depositETH(
        100000,
       "0x0",{
        value: ethers.utils.parseEther("0.01")
       }
    )
 
}


// mint();
depositMainnet();
