import { ethers } from "hardhat";   

const owner = "0xCaD132F770cFBC2B3c512C0FF35c4d9fc37476c9" // l1bridge proxy owner

// notice: will revisit in the future, haven't tested it yet.
const upgradeL1bridge = async() => {
    const proxyABI = require("../../artifacts/contracts/Proxy.sol/Proxy.json");
    const L1BRIDGE = process.env.CONTRACTS_L1BRIDGE_ADDRESS || ""
    const [PROXY_OWNER, FORCE_OWNER] = await ethers.getSigners()
    if(PROXY_OWNER == undefined || FORCE_OWNER == undefined) throw new Error("Signers are undefined")
    if(L1BRIDGE == "") throw new Error("L1BRIDGE not found")

    ////////
    // todo : Check owner code
    ////////

    // Load the proxy contract and proceed with the upgrade
    const proxy:any = new ethers.Contract(L1BRIDGE, proxyABI.abi, ethers.provider);

    // Check your gas : Look up contracts to upgrade 
    const upgradeContract= await ethers.getContractFactory("UpgradeL1Bridge");
    const upgradedL1Bridge = await upgradeContract.connect(PROXY_OWNER).deploy();

    // Upgrade the L1Bridge contract 
    await proxy.connect(PROXY_OWNER).setCode(await upgradedL1Bridge.getDeployedCode())
    
    // Test the upgrade, No gas required.
    const messenger = "0xfd76ef26315Ea36136dC40Aeafb5D276d37944AE" // l1bridge messenger
    const l2Bridge = process.env.CONTRACTS_L2BRIDGE_ADDRESS || "";
    const value = "77" 

    const upgradedContract = await ethers.getContractAt("UpgradeL1Bridge", L1BRIDGE)

    const _l2Bridge = await upgradedContract.l2TokenBridge()
    if(_l2Bridge == "" || _l2Bridge !== l2Bridge) throw new Error("Fail to upgrade L1Bridge contract")

    const _messenger = await upgradedContract.messenger()
    if(_messenger == "" || _messenger !== messenger) throw new Error("Fail to upgrade L1Bridge contract")

    const zeroAddress = ethers.ZeroAddress
    const hashed =await upgradedContract.generateKey(zeroAddress, zeroAddress, value)
    const _hshed = ethers.solidityPackedKeccak256(['address', 'address', 'uint256'], [zeroAddress, zeroAddress, value])
    if(hashed !== _hshed) throw new Error("Fail to upgrade L1Bridge contract")
}

export default upgradeL1bridge();