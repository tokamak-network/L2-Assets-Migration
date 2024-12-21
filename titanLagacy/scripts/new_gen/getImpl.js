const hre = require("hardhat");
const { ethers } = hre;


async function getImpl() {
    const [deployer] = await ethers.getSigners();

    const proxy = await ethers.getContractAt("Proxy", process.env.CONTRACTS_L1BRIDGE_ADDRESS)
    console.log("impl : -> ",await proxy.connect(deployer).callStatic.getImplementation() )

}

const main = async () => {
    await getImpl()
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
console.error(error);
process.exitCode = 1;
});