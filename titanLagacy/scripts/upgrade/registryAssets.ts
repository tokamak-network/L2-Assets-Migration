import { ethers } from "hardhat";   

const registryAssets = async() => {
    const proxyABI = require("../../artifacts/contracts/Proxy.sol/Proxy.json");
    const L1BRIDGE = process.env.CONTRACTS_L1BRIDGE_ADDRESS || ""
    const [PROXY_OWNER, FORCE_OWNER] = await ethers.getSigners()
    if(PROXY_OWNER == undefined || FORCE_OWNER == undefined) throw new Error("Signers are undefined")
    if(L1BRIDGE == "") throw new Error("L1BRIDGE not found")


    ////////
    // todo : Asset registration required, subject to contract modification 
    ////////

    


}

export default registryAssets();


