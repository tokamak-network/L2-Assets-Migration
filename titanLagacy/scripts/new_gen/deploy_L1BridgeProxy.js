const { ethers, run } = require("hardhat");

async function DeployL1ChugSplashProxy2() {
    const [deployer] = await ethers.getSigners();
    console.log("deployer Address : ", deployer.address)
    
    //==== L1ChugSplashProxy2 =================================
    const L1ChugSplashProxy2Dep = await ethers.getContractFactory("L1ChugSplashProxy2");
    const L1ChugSplashProxy2 = await L1ChugSplashProxy2Dep.deploy(deployer.address);
    await L1ChugSplashProxy2.deployed();
    console.log('L1ChugSplashProxy2' , L1ChugSplashProxy2.address)

}

const main = async () => {
  await DeployL1ChugSplashProxy2()
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
