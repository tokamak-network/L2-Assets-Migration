const hre = require("hardhat");
const { ethers } = hre;
const fs = require('fs');
const axios  = require('axios');
const { BigNumber } = require("ethers")

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
    
    let l1TON = "0xa30fe40285B8f5c0457DbC3B7C8A280373c40044"
    let l1ETH = "0x0000000000000000000000000000000000000000"
    let l1USDT = "0x42d3b260c761cD5da022dB56Fe2F89c4A909b04A"
    let l1TOS = "0xFF3Ef745D9878AfE5934Ff0b130868AFDDbc58e8"
    let l1USDC = "0x693a591A27750eED2A0e14BC73bB1F313116a1cb"

    const oneETH = ethers.utils.parseUnits('1', 18)

    
    //==== Set UpgradeL1BridgeLogic =================================
    let UpgradeL1BridgeLogic = new ethers.Contract(
        L1BridgeProxyAddr,
        UpgradeL1Bridge_ABI.abi,
        deployer
    )

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

    let positionAddress = "0x1a7dFF905E30d36578b6b2aC46089dEc51531067"

    let readFile1 ='./data/new-generate-assets.json'
    let assets
    if (await fs.existsSync(readFile1)) assets = JSON.parse(await fs.readFileSync(readFile1));
    // console.log(assets)
    // console.log(assets.length)
    let tokenAddr
    let Hash
    let Account
    let Amount
    let getAccount
    let getAddress
    let testZeroAddr = "0x0000000000000000000000000000000000000000";

    for(let i = 0; i < assets.length; i++) {
        tokenAddr = assets[i].l1Token
        console.log("tokenAddr : ", tokenAddr);
        // console.log(assets[i].data.length);
        for(let j = 0; j < assets[i].data.length; j++) {
            Account = assets[i].data[j].claimer
            Amount = ethers.BigNumber.from(assets[i].data[j].amount)
            Hash = assets[i].data[j].hash
            
            await ethers.provider.send('hardhat_impersonateAccount', [
                Account
            ])
            getAccount = await ethers.getSigner(Account);
            
            if(i == 0 && j ==0){
                console.log("Account : ", getAccount.address)
                console.log("Amount : ", Amount)
                console.log("Hash : ", Hash)
            }
            getAddress = await UpgradeL1BridgeLogic.connect(getAccount).getForcePosition(Hash)
            
            if(getAddress == testZeroAddr) {
                console.log("error :", Hash)
                break;
            }

            await UpgradeL1BridgeLogic.connect(getAccount).forceWithdrawClaim(
                positionAddress,
                Hash,
                tokenAddr,
                Amount
            )

            getAddress = await UpgradeL1BridgeLogic.connect(getAccount).gb(Hash)
            
            if(getAddress == Account) {
                console.log("gb error :", Hash)
                break;
            }
        }
    }


    // let getAddress = await UpgradeL1BridgeLogic.connect(tester).getForcePosition(TONHash)
    // console.log("TONHash getAddress : ", getAddress);

    // getAddress = await UpgradeL1BridgeLogic.connect(tester).getForcePosition(TOSHash)
    // console.log("TOSHash getAddress : ", getAddress);

    // getAddress = await UpgradeL1BridgeLogic.connect(tester).getForcePosition(ETHHash)
    // console.log("ETHHash getAddress : ", getAddress);

    // getAddress = await UpgradeL1BridgeLogic.connect(tester).getForcePosition(USDTHash)
    // console.log("USDTHash getAddress : ", getAddress);

    // getAddress = await UpgradeL1BridgeLogic.connect(tester).getForcePosition(USDCHash)
    // console.log("USDCHash getAddress : ", getAddress);

    // getAddress = await UpgradeL1BridgeLogic.connect(tester).getForcePosition(NoHash)
    // console.log("No Hash getAddress : ", getAddress);

    // let beforeTONAmount = await TON.connect(tester).balanceOf(tester.address)
    // console.log("beforeTONAmount :", beforeTONAmount);
    
    
    // await UpgradeL1BridgeLogic.connect(tester).forceWithdrawClaim(
    //     positionAddress,
    //     TONHash,
    //     l1TON,
    //     TONAmount
    // )

    // let afterTONAmount = await TON.connect(tester).balanceOf(tester.address)
    // console.log("afterTONAmount :", afterTONAmount);

    // let beforeTOSAmount = await TOS.connect(tester).balanceOf(tester.address)
    // console.log("beforeTOSAmount :", beforeTOSAmount);
    
    
    // await UpgradeL1BridgeLogic.connect(tester).forceWithdrawClaim(
    //     positionAddress,
    //     TOSHash,
    //     l1TOS,
    //     TOSAMount
    // )

    // let afterTOSAmount = await TOS.connect(tester).balanceOf(tester.address)
    // console.log("afterTOSAmount :", afterTOSAmount);

    // let beforeUSDTAmount = await USDT.connect(tester).balanceOf(tester.address)
    // console.log("beforeUSDTAmount :", beforeUSDTAmount);
    
    
    // await UpgradeL1BridgeLogic.connect(tester).forceWithdrawClaim(
    //     positionAddress,
    //     USDTHash,
    //     l1USDT,
    //     USDTAMount
    // )

    // let afterUSDTAmount = await USDT.connect(tester).balanceOf(tester.address)
    // console.log("afterUSDTAmount :", afterUSDTAmount);

    // let beforeETHAmount = await tester.getBalance()
    // console.log("beforeETHAmount :", beforeETHAmount);

    // await UpgradeL1BridgeLogic.connect(tester).forceWithdrawClaim(
    //     positionAddress,
    //     ETHHash,
    //     l1ETH,
    //     ETHAMount
    // )

    // let afterETHAmount = await tester.getBalance()
    // console.log("afterETHAmount :", afterETHAmount);

    // let beforeUSDCAmount = await USDC.connect(tester2).balanceOf(tester2.address)
    // console.log("beforeUSDCAmount :", beforeUSDCAmount);
    
    
    // await UpgradeL1BridgeLogic.connect(tester2).forceWithdrawClaim(
    //     positionAddress,
    //     USDCHash,
    //     l1USDC,
    //     USDCAMount
    // )

    // let afterUSDCAmount = await USDC.connect(tester2).balanceOf(tester2.address)
    // console.log("afterUSDCAmount :", afterUSDCAmount);





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
