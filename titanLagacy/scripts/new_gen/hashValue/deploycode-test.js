const hre = require("hardhat");
const { ethers } = hre;

const UpgradeL1Bridge_ABI = require("../../../artifacts/contracts/UpgradeL1Bridge.sol/UpgradeL1Bridge.json")
const TON_ABI = require("../../abi/TON.json")


function sleep(ms) {
    const wakeUpTime = Date.now() + ms;
    while (Date.now() < wakeUpTime) {}
}

async function deployCodeTest() {
    // 0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea
    const [deployer] = await ethers.getSigners();
    console.log("deployer Address : ", deployer.address)

    // const owner = "0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea"
    // await ethers.provider.send('hardhat_impersonateAccount', [
    //         owner
    //     ]
    // )
    // await ethers.provider.send('hardhat_setBalance', [
    //     owner, 
    //     '0x152D02C7E14AF6800000'
    // ]);

    // const owner2 = "0xb68aa9e398c054da7ebaaa446292f611ca0cd52b"
    // await ethers.provider.send('hardhat_impersonateAccount', [
    //     owner2
    //     ]
    // )
    // await ethers.provider.send('hardhat_setBalance', [
    //     owner2, 
    //     '0x152D02C7E14AF6800000'
    // ]);
    // let tester = await ethers.getSigner(owner);
    // console.log("Tester1 :", tester.address);
    // let tester2 = await ethers.getSigner(owner2);
    // console.log("Tester2 :", tester2.address);


    const L1BridgeProxyAddr = "0x1F032B938125f9bE411801fb127785430E7b3971"
    const oneETH = ethers.utils.parseUnits('1', 18)

    const DEPLOY_CODE_PREFIX = "0x600D380380600D6000396000f3";
    // const DEPLOY_CODE_PREFIX2 = byte(0x600D380380600D6000396000f3);
    console.log("DEPLOY_CODE_PREFIX :", DEPLOY_CODE_PREFIX);
    // console.log("DEPLOY_CODE_PREFIX2 :", DEPLOY_CODE_PREFIX2);

    
    //==== Set UpgradeL1BridgeLogic =================================
    let UpgradeL1BridgeLogic = new ethers.Contract(
        L1BridgeProxyAddr,
        UpgradeL1Bridge_ABI.abi,
        deployer
    )

    // let keccakCode = ethers.utils.solidityKeccak256(["bytes"],[UpgradeL1Bridge_ABI.deployedBytecode])
    // console.log("keccakCode :", keccakCode)
    
    let encode = ethers.utils.solidityPack(["bytes", "bytes"],[DEPLOY_CODE_PREFIX,UpgradeL1Bridge_ABI.deployedBytecode])
    console.log("encode :", encode)
    


}


const main = async () => {
  await deployCodeTest()
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
