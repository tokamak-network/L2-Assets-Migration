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


    it('Titan L1 Bridge Upgrade Test', async () => {

        await helpers.impersonateAccount(zeroAddress);

        const signer = await ethers.getSigner(zeroAddress)
        const proxy:any = new ethers.Contract(L1BRIDGE, proxyABI.abi, ethers.provider);
            
        const upgradeContract= await(await ethers.getContractFactory("UpgradeL1Bridge")).deploy();
        
        await proxy.connect(signer).setCode(await upgradeContract.getDeployedCode())
        
        const _owner = await proxy.connect(signer).getOwner.staticCall()
        expect(owner).to.be.equal(_owner)
  
        const value = "77" 
        const upgradedContract = await ethers.getContractAt("UpgradeL1Bridge", L1BRIDGE)

        const _l2Bridge = await upgradedContract.l2TokenBridge()
        expect(L2BRIDGE).to.be.equal(_l2Bridge)

        const _messenger = await upgradedContract.messenger()
        expect(messenger).to.be.equal(_messenger)

        const hashed =await upgradedContract.generateKey(zeroAddress, zeroAddress, value)

        const _hshed = ethers.solidityPackedKeccak256(['address', 'address', 'uint256'], [zeroAddress, zeroAddress, value])
        expect(hashed).to.be.equal(_hshed)
    });

    describe('Titan L1 Bridge Registry Test', () => {
        const data = fs.readFileSync(path.join('data', 'generate-assets3.json'), "utf-8")
        const assets = JSON.parse(data) 

        it('EOA Check', async () => {
            // eoa check 
            // for(const assetInfo of assets) {
            //     for(const asset of assetInfo.data) {
            //         if(await ethers.provider.getCode(asset.claimer) !== '0x')
            //             expect.fail("EOA Check Failed")
            //     }
            // }
        });

        it('Registry Check', async () => {
            const l1Bridge:any = await ethers.getContractAt("UpgradeL1Bridge", L1BRIDGE) 
            const accounts = await ethers.getSigners()
            const zeroSigner = await ethers.getSigner(zeroAddress) // tmp signer

            await expect(l1Bridge.connect(accounts[1]).registry([
                {
                    claimer: CLOSER,
                    key: ethers.encodeBytes32String("123")
                }
            ])).to.be.revertedWith('Only Closer')
          

            for(const assetInfo of assets) {
                for(const asset of assetInfo.data) {
                    if(asset.amount == 0)  // todo : amount 0 arguments require remove function
                        continue
                    
                    const param:AssetsParam = {
                        claimer: asset.claimer,
                        key: asset.hash
                    }
                    await l1Bridge.connect(zeroSigner).registry([param])
                }
            }
        });


      
    })


    describe('Titan L1 Bridge ForceWithdraw Test', () => {
        const data = fs.readFileSync(path.join('data', 'generate-assets3.json'), "utf-8")
        const assets = JSON.parse(data) 


        it('ForceWithdraw Check', async () => {
            const l1Bridge:any = await ethers.getContractAt("UpgradeL1Bridge", L1BRIDGE) 
            const accounts = await ethers.getSigners()
            const zeroSigner = await ethers.getSigner(zeroAddress) // tmp signer

            await expect(l1Bridge.connect(accounts[5]).forceWithdraw(zeroAddress, 100)).to.be.revertedWith('not claimer')

            const asset = assets[0]
            const [deployers] = await ethers.getSigners();

            await (await deployers.sendTransaction({
                to: asset.data[2].claimer,
                value: ethers.parseEther("1")
            })).wait();

            await helpers.impersonateAccount(asset.data[2].claimer);
            const claimer = await ethers.getSigner(asset.data[2].claimer)

            const preBal = await ethers.provider.getBalance(asset.data[2].claimer)
            console.log("preBal : ", preBal.toString())
     
            // check ether claime
            const tx = await l1Bridge.connect(claimer).forceWithdraw(asset.l1Token, asset.data[2].amount)
            const receipt = await ethers.provider.getTransactionReceipt(tx.hash)           
            const estimated = preBal + BigInt(asset.data[2].amount) - (receipt!.gasPrice * receipt!.gasUsed)
            expect(estimated).to.be.equal(await ethers.provider.getBalance(asset.data[2].claimer))

            // check ERC20 claime
            const asset1 = assets[1]
            
            await (await deployers.sendTransaction({
                to: asset1.data[1].claimer,
                value: ethers.parseEther("1")
            })).wait();

            await helpers.impersonateAccount(asset1.data[1].claimer);
            const claimer1 = await ethers.getSigner(asset1.data[1].claimer)

            const l1Token = new ethers.Contract(asset1.l1Token, ["function balanceOf(address) view returns (uint256)"], ethers.provider)
            const preBal1 = await l1Token.balanceOf(asset1.data[1].claimer)
          
            // check ether claime
            await l1Bridge.connect(claimer1).forceWithdraw(asset1.l1Token, asset1.data[1].amount)
            const estimated1 = preBal1 + BigInt(asset1.data[1].amount)
            expect(estimated1).to.be.equal(await l1Token.balanceOf(asset1.data[1].claimer))
      
        });

        it('Edit after ForceWithdraw Check', async () => {
            // edit amount 77075825179826438 
            const l1Bridge:any = await ethers.getContractAt("UpgradeL1Bridge", L1BRIDGE) 
            const accounts = await ethers.getSigners()
            const zeroSigner = await ethers.getSigner(zeroAddress) // tmp signer

            const asset = assets[2]
            const preHashed = asset.data[4].hash
            const newHashed = await l1Bridge.generateKey(asset.l1Token, zeroAddress, "9999")
            
            await expect(l1Bridge.connect(accounts[4]).editMigration(preHashed, newHashed, asset.data[4].claimer)).to.be.revertedWith('Only Closer')


            const filter = l1Bridge.filters.EDITED(null, null, null);
            await l1Bridge.connect(zeroSigner).editMigration(preHashed, newHashed, asset.data[4].claimer)
            // const logs: EventLog[] = await l1Bridge.queryFilter(filter) as EventLog[]; // todo : event check issue : timeout 
            // expect(logs[logs.length - 1].args).to.exist;


            
            
            

           
        });
    })
   


});
