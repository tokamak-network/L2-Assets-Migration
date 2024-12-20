const { ethers, run } = require("hardhat");

async function DeployGenBridgeStorage1() {

    //==== GenBridgeStorage1 =================================
    const GenBridgeStorage1Dep = await ethers.getContractFactory("GenBridgeStorage1");
    const GenBridgeStorage1 = await GenBridgeStorage1Dep.deploy();
    await GenBridgeStorage1.deployed();
    console.log('GenBridgeStorage1' , GenBridgeStorage1.address)

}

const main = async () => {
  await DeployGenBridgeStorage1()
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
