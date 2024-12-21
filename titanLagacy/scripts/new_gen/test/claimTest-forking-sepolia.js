const hre = require("hardhat");
const { ethers } = hre;

const UpgradeL1Bridge_ABI = require("../../../artifacts/contracts/UpgradeL1Bridge.sol/UpgradeL1Bridge.json")
const TON_ABI = require("../../abi/TON.json")


function sleep(ms) {
    const wakeUpTime = Date.now() + ms;
    while (Date.now() < wakeUpTime) {}
}

async function claimTest() {
    // 0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea
    const [deployer] = await ethers.getSigners();
    console.log("deployer Address : ", deployer.address)

    const owner = "0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea"
    await ethers.provider.send('hardhat_impersonateAccount', [
            owner
        ]
    )
    // await ethers.provider.send('hardhat_setBalance', [
    //     owner, 
    //     '0x152D02C7E14AF6800000'
    // ]);

    const owner2 = "0xb68aa9e398c054da7ebaaa446292f611ca0cd52b"
    await ethers.provider.send('hardhat_impersonateAccount', [
        owner2
        ]
    )
    await ethers.provider.send('hardhat_setBalance', [
        owner2, 
        '0x152D02C7E14AF6800000'
    ]);
    let tester = await ethers.getSigner(owner);
    console.log("Tester1 :", tester.address);
    let tester2 = await ethers.getSigner(owner2);
    console.log("Tester2 :", tester2.address);


    const L1BridgeProxyAddr = "0x1F032B938125f9bE411801fb127785430E7b3971"
    const oneETH = ethers.utils.parseUnits('1', 18)

    
    //==== Set UpgradeL1BridgeLogic =================================
    let UpgradeL1BridgeLogic = new ethers.Contract(
        L1BridgeProxyAddr,
        UpgradeL1Bridge_ABI.abi,
        deployer
    )

    let positionAddress = "0x1a7dFF905E30d36578b6b2aC46089dEc51531067"


    //onwer1
    let TONHash = "0xd9f5d9d671fe106bbfb7a09190ad3442d6b09a407c1a4faa248662881cd4f887"
    let TONAmount = ethers.BigNumber.from("13937332320000000100000")
    let l1TON = "0xa30fe40285B8f5c0457DbC3B7C8A280373c40044"

    let ETHHash = "0x964d8433b7db6d963386e06608b083fee40ad1a7b12ee75d081c878dc95431db"
    let ETHAMount = ethers.BigNumber.from("609983199953732915")
    let l1ETH = "0x0000000000000000000000000000000000000000"

    let USDTHash = "0xada3b093f3324e18dc1793fcf1c7cf6b72f02ff7160e4a79ea5619f75da20988"
    let USDTAMount = ethers.BigNumber.from("2927000220")
    let l1USDT = "0x42d3b260c761cD5da022dB56Fe2F89c4A909b04A"

    let TOSHash = "0x44ec157ed78cef8f4f244356a5a84c616a44dc27180a4fcd1189890afc433ff8"
    let TOSAMount = ethers.BigNumber.from("10000000000000000000")
    let l1TOS = "0xFF3Ef745D9878AfE5934Ff0b130868AFDDbc58e8"

    //owner2
    let USDCHash = "0xc93c02acea5f89bec1881615a84caa9c47c217877ef110a9322a7f5b1939b0c4"
    let USDCAMount = ethers.BigNumber.from("8999998")
    let l1USDC = "0x693a591A27750eED2A0e14BC73bB1F313116a1cb"

    let NoHash = "0x44ec157ed78cef8f4f244356a5a84c616a44dc27180a4fcd1189890afc433000"
    

    let TON = new ethers.Contract(
        l1TON,
        TON_ABI.abi,
        deployer
    )

    let TOS = new ethers.Contract(
        l1TOS,
        TON_ABI.abi,
        deployer
    )

    let USDT = new ethers.Contract(
        l1USDT,
        TON_ABI.abi,
        deployer
    )

    let USDC = new ethers.Contract(
        l1USDC,
        TON_ABI.abi,
        deployer
    )
    


    let getAddress = await UpgradeL1BridgeLogic.connect(tester).getForcePosition(TONHash)
    console.log("TONHash getAddress : ", getAddress);

    getAddress = await UpgradeL1BridgeLogic.connect(tester).getForcePosition(TOSHash)
    console.log("TOSHash getAddress : ", getAddress);

    getAddress = await UpgradeL1BridgeLogic.connect(tester).getForcePosition(ETHHash)
    console.log("ETHHash getAddress : ", getAddress);

    getAddress = await UpgradeL1BridgeLogic.connect(tester).getForcePosition(USDTHash)
    console.log("USDTHash getAddress : ", getAddress);

    getAddress = await UpgradeL1BridgeLogic.connect(tester).getForcePosition(USDCHash)
    console.log("USDCHash getAddress : ", getAddress);

    getAddress = await UpgradeL1BridgeLogic.connect(tester).getForcePosition(NoHash)
    console.log("No Hash getAddress : ", getAddress);

    let beforeTONAmount = await TON.connect(tester).balanceOf(tester.address)
    console.log("beforeTONAmount :", beforeTONAmount);
    
    
    await UpgradeL1BridgeLogic.connect(tester).forceWithdrawClaim(
        positionAddress,
        TONHash,
        l1TON,
        TONAmount
    )

    let afterTONAmount = await TON.connect(tester).balanceOf(tester.address)
    console.log("afterTONAmount :", afterTONAmount);

    let beforeTOSAmount = await TOS.connect(tester).balanceOf(tester.address)
    console.log("beforeTOSAmount :", beforeTOSAmount);
    
    
    await UpgradeL1BridgeLogic.connect(tester).forceWithdrawClaim(
        positionAddress,
        TOSHash,
        l1TOS,
        TOSAMount
    )

    let afterTOSAmount = await TOS.connect(tester).balanceOf(tester.address)
    console.log("afterTOSAmount :", afterTOSAmount);

    let beforeUSDTAmount = await USDT.connect(tester).balanceOf(tester.address)
    console.log("beforeUSDTAmount :", beforeUSDTAmount);
    
    
    await UpgradeL1BridgeLogic.connect(tester).forceWithdrawClaim(
        positionAddress,
        USDTHash,
        l1USDT,
        USDTAMount
    )

    let afterUSDTAmount = await USDT.connect(tester).balanceOf(tester.address)
    console.log("afterUSDTAmount :", afterUSDTAmount);

    let beforeETHAmount = await tester.getBalance()
    console.log("beforeETHAmount :", beforeETHAmount);

    await UpgradeL1BridgeLogic.connect(tester).forceWithdrawClaim(
        positionAddress,
        ETHHash,
        l1ETH,
        ETHAMount
    )

    let afterETHAmount = await tester.getBalance()
    console.log("afterETHAmount :", afterETHAmount);

    let beforeUSDCAmount = await USDC.connect(tester2).balanceOf(tester2.address)
    console.log("beforeUSDCAmount :", beforeUSDCAmount);
    
    
    await UpgradeL1BridgeLogic.connect(tester2).forceWithdrawClaim(
        positionAddress,
        USDCHash,
        l1USDC,
        USDCAMount
    )

    let afterUSDCAmount = await USDC.connect(tester2).balanceOf(tester2.address)
    console.log("afterUSDCAmount :", afterUSDCAmount);





}


const main = async () => {
  await claimTest()
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
