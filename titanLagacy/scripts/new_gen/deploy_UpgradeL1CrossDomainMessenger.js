const { ethers, run } = require("hardhat");

async function DeployUpgradeL1CrossDomainMessenger() {

    //==== UpgradeL1CrossDomainMessenger =================================
    const UpgradeL1CrossDomainMessengerDep = await ethers.getContractFactory("UpgradeL1CrossDomainMessenger");
    const UpgradeL1CrossDomainMessenger = await UpgradeL1CrossDomainMessengerDep.deploy();
    await UpgradeL1CrossDomainMessenger.deployed();
    console.log('UpgradeL1CrossDomainMessenger' , UpgradeL1CrossDomainMessenger.address)

}

const main = async () => {
  await DeployUpgradeL1CrossDomainMessenger()
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
