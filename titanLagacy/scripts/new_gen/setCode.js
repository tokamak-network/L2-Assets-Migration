const { ethers, run } = require("hardhat");

const L1ChugSplashProxy2_ABI = require("../../artifacts/contracts/proxy/L1ChugSplashProxy2.sol/L1ChugSplashProxy2.json")
const UpgradeL1Bridge_ABI = require("../../artifacts/contracts/UpgradeL1Bridge.sol/UpgradeL1Bridge.json")

async function setCode() {
    const [deployer] = await ethers.getSigners();
    console.log("deployer Address : ", deployer.address)

    let L1ChugSplashProxy2Addr = "0xc143e262E80f16f8239a173BC1Cf463A5710D268"
    
    //==== set L1ChugSplashProxy2 =================================
    let L1ChugSplashProxy2 = new ethers.Contract(
      L1ChugSplashProxy2Addr,
      L1ChugSplashProxy2_ABI.abi,
      ethers.provider
    )

    let tx = await L1ChugSplashProxy2.connect(deployer).setCode(
      UpgradeL1Bridge_ABI.deployedBytecode
    )
    console.log(tx)
    

}

const main = async () => {
  await setCode()
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
