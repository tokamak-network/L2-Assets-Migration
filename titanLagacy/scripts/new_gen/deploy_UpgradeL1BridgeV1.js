const { ethers, run } = require("hardhat");

async function DeployUpgradeL1BridgeV1() {

    //==== UpgradeL1Bridge =================================
    const UpgradeL1BridgeDep = await ethers.getContractFactory("UpgradeL1BridgeV1");
    const myContract = await UpgradeL1BridgeDep.deploy();
    await myContract.deployed();
    console.log('UpgradeL1BridgeV1' , myContract.address)

}

const main = async () => {
  await DeployUpgradeL1BridgeV1()
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
