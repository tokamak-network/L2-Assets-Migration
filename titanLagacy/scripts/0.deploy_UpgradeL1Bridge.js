const { ethers, run } = require("hardhat");

async function DeployUpgradeL1Bridge() {

    //==== UpgradeL1Bridge =================================
    const UpgradeL1BridgeDep = await ethers.getContractFactory("UpgradeL1Bridge");
    const myContract = await UpgradeL1BridgeDep.deploy();
    await myContract.deployed();
    console.log('UpgradeL1Bridge' , myContract.address)
    // await myContract.deployTransaction.wait(5);

     //==== verify =================================
     if (hre.network.name != "hardhat") {
        await hre.run("etherscan-verify", {
            network: hre.network.name
        });
    }
}

const main = async () => {
  await DeployUpgradeL1Bridge()
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
