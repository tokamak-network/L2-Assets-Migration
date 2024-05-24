// import { ethers as ethers2} from "ethers2";
import { expect } from "chai";
import { ethers } from "hardhat";
import path from 'path'
import fs from 'fs'
import { ERC20 } from "../../scripts/types"

export default describe('# Unit Test : L1 StandardBridge', () => {
    const proxyABI = require("../../artifacts/contracts/Proxy.sol/Proxy.json");
    const l1BridgeABI = require("../../artifacts/contracts/UpgradeL1BridgeD.sol/UpgradeL1BridgeD.json");
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


    it('Titan Paused Test', async () => {
        const upgradedContract = await ethers.getContractAt("UpgradeL1BridgeD", L1BRIDGE)        
        const zeroSigner = await ethers.getSigner(zeroAddress) // tmp signer

        await (upgradedContract.connect(zeroSigner) as any).forceActive(true);
        //ETH 
        await expect(upgradedContract.depositETH(100000, ethers.encodeBytes32String("0x0"))).to.be.revertedWith("Paused L1StandardBridge")
        await expect(upgradedContract.depositETHTo(owner, 100000, ethers.encodeBytes32String("0x0"))).to.be.revertedWith("Paused L1StandardBridge")
        
        //ERC20 
        await expect(upgradedContract.depositERC20(zeroAddress, zeroAddress, 100000, 100000, ethers.encodeBytes32String("0x0"))).to.be.revertedWith("Paused L1StandardBridge")
        await expect(upgradedContract.depositERC20To(zeroAddress, zeroAddress, owner, 100000, 100000, ethers.encodeBytes32String("0x0"))).to.be.revertedWith("Paused L1StandardBridge")
    })


    it('Registry Check', async () => {
        const l1Bridge:any = await ethers.getContractAt("UpgradeL1BridgeD", L1BRIDGE) 
        const accounts = await ethers.getSigners()
        const zeroSigner = await ethers.getSigner(zeroAddress) // tmp signer
        
        let params:any = []
        let count = 0;
        let max = 999;
        for(const assetInfo of assets) {
            // if(assetInfo.l1Token !== "0x0000000000000000000000000000000000000000")
            //     continue
            for(const asset of assetInfo.data) {
                if(asset.amount == 0) // todo : amount 0 arguments require remove function
                    continue    
                
                if(count != max) {
                    params.push({
                        token: assetInfo.l1Token,
                        to: asset.claimer,
                        amount: asset.amount,
                        index: asset.hash
                    })
                    ++count;
                }

                if(count == max) {
                    await l1Bridge.connect(zeroSigner).forceWithdrawAll(params)
                    params.length = 0;
                    count = 0;
                }
                // const param:any = {
                //     token: assetInfo.l1Token,
                //     to: asset.claimer,
                //     amount: asset.amount,
                //     index: asset.hash
                // }           
            }
        }
        params.length > 0 ? await l1Bridge.connect(zeroSigner).forceWithdrawAll(params) : ""
    
        // check balance 
        // for(const assetInfo of assets) {
        //     if(assetInfo.l1Token === "0x0000000000000000000000000000000000000000"){
        //         console.log(assetInfo.tokenName,": ", await ethers.provider.getBalance(L1BRIDGE));
        //     }else{
        //         const l1token = await ethers.getContractAt(ERC20, assetInfo.l1Token)   
        //         console.log(assetInfo.tokenName,": ", await l1token.balanceOf(L1BRIDGE));
        //     }
        // }

        // check event 
        // event ForceWithdraw(bytes32 indexed _index, address indexed _token, address indexed _claimer, uint _amount);
        // const b:any = new ethers.Contract(L1BRIDGE, l1BridgeABI.abi, ethers.provider);
        // const events:any = await b.queryFilter(b.filters.ForceWithdraw(null,null,null,null), 2000, 'latest');
        // console.log(events.length)
    });


});
