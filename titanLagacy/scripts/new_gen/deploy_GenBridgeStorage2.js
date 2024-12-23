const { ethers, run } = require("hardhat");

async function DeployGenBridgeStorage2() {

    //==== GenBridgeStorage2 =================================
    const GenBridgeStorage2Dep = await ethers.getContractFactory("GenBridgeStorage2");
    const GenBridgeStorage2 = await GenBridgeStorage2Dep.deploy();
    await GenBridgeStorage2.deployed();
    console.log('GenBridgeStorage2' , GenBridgeStorage2.address)

}

const main = async () => {
  await DeployGenBridgeStorage2()
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
