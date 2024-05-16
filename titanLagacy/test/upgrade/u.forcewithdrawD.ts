import { expect } from "chai";
import { ethers } from "hardhat";
import {AssetsParam, ClaimParam} from "../../scripts/types"
import path from 'path'
import fs from 'fs'
import { EventLog } from "ethers";

export default describe('# Unit Test : L1 StandardBridge', () => {
    const proxyABI = require("../../artifacts/contracts/Proxy.sol/Proxy.json");
    const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");
    const L1BRIDGE = process.env.CONTRACTS_L1BRIDGE_ADDRESS || "";  
    const L2BRIDGE = process.env.CONTRACTS_L2BRIDGE_ADDRESS || "";
    const messenger = "0xfd76ef26315Ea36136dC40Aeafb5D276d37944AE"
    const owner = "0xCaD132F770cFBC2B3c512C0FF35c4d9fc37476c9" // l1bridge proxy owner
    const zeroAddress = ethers.ZeroAddress
    const CLOSER = zeroAddress // check : Make sure to set it to your admin wallet address for actual deployment 

    const data = fs.readFileSync(path.join('data', 'generate-assets3.json'), "utf-8")
    const assets = JSON.parse(data) 


    it('Titan L1 Bridge Upgrade Test', async () => {
        await helpers.impersonateAccount(zeroAddress);

        const signer = await ethers.getSigner(zeroAddress)
        const proxy:any = new ethers.Contract(L1BRIDGE, proxyABI.abi, ethers.provider);
            
        const upgradeContract= await(await ethers.getContractFactory("UpgradeL1BridgeD")).deploy();
        
        await proxy.connect(signer).setCode(await upgradeContract.getDeployedCode())
        
        const _owner = await proxy.connect(signer).getOwner.staticCall()
        expect(owner).to.be.equal(_owner)
  
        const upgradedContract = await ethers.getContractAt("UpgradeL1BridgeD", L1BRIDGE)

        const _l2Bridge = await upgradedContract.l2TokenBridge()
        expect(L2BRIDGE).to.be.equal(_l2Bridge)

        const _messenger = await upgradedContract.messenger()
        expect(messenger).to.be.equal(_messenger)
    });

    it('Registry Check', async () => {
        const l1Bridge:any = await ethers.getContractAt("UpgradeL1BridgeD", L1BRIDGE) 
        const accounts = await ethers.getSigners()
        const zeroSigner = await ethers.getSigner(zeroAddress) // tmp signer

        await l1Bridge.connect(zeroSigner).forceActive()
        // @param 
        // address token;
        // address to; 
        // uint amount;
        // bytes32 hash;
        for(const assetInfo of assets) {
            if(assetInfo.l1Token === "0x0000000000000000000000000000000000000000")
                continue
            
            for(const asset of assetInfo.data) {
                if(asset.amount == 0) // todo : amount 0 arguments require remove function
                    continue    
                
                
                const param:any = {
                    token: assetInfo.l1Token,
                    to: asset.claimer,
                    amount: asset.amount
                }
                
                await l1Bridge.connect(zeroSigner).forceWithdrawAll([param])
            }
        }
    });


});
