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

    it('Titan L1 forceActive Check Test', async () => {
        const l1Bridge:any = await ethers.getContractAt("UpgradeL1Bridge", L1BRIDGE)
        const zeroSigner = await ethers.getSigner(zeroAddress) // tmp signer
        expect(await l1Bridge.active()).to.be.false // default value

        await expect(l1Bridge.forceActive()).to.be.revertedWith('Only Closer')
        await l1Bridge.connect(zeroSigner).forceActive()

        expect(await l1Bridge.active()).to.be.true
        
    });

    describe('Titan L1 Bridge Registry Test', () => {
        const data = fs.readFileSync(path.join('data', 'generate-assets3.json'), "utf-8")
        const assets = JSON.parse(data) 

        it('EOA Check', async () => {
            // eoa check 
            for(const assetInfo of assets) {
                for(const asset of assetInfo.data) {
                    if(await ethers.provider.getCode(asset.claimer) !== '0x')
                        expect.fail("EOA Check Failed")
                }
            }
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
            const l1Bridge:any = await ethers.getContractAt("UpgradeL1Bridge", L1BRIDGE) 
            const zeroSigner = await ethers.getSigner(zeroAddress) // tmp signer
            const [deployers, ac1] = await ethers.getSigners();

            const asset = assets[2]
            const preHashed = asset.data[4].hash // pre old amount 77075825179826438 
            const newHashed = await l1Bridge.generateKey(asset.l1Token, asset.data[4].claimer, "778787878787878")
            const l1Token = new ethers.Contract(asset.l1Token, ["function balanceOf(address) view returns (uint256)"], ethers.provider)
            await expect(l1Bridge.connect(ac1).editMigration(preHashed, newHashed, asset.data[4].claimer)).to.be.revertedWith('Only Closer')


            const filter = l1Bridge.filters.Edited(null, null, null);
            await l1Bridge.connect(zeroSigner).editMigration(preHashed, newHashed, asset.data[4].claimer)
            // const logs: EventLog[] = await l1Bridge.queryFilter(filter) as EventLog[]; // todo : event check issue : timeout 
            // expect(logs[logs.length - 1].args).to.exist;

            await (await deployers.sendTransaction({
                to: asset.data[4].claimer,
                value: ethers.parseEther("1")
            })).wait();


            await helpers.impersonateAccount(asset.data[4].claimer);
            const claimer = await ethers.getSigner(asset.data[4].claimer)
            const preBal = await l1Token.balanceOf(asset.data[4].claimer)
            await l1Bridge.connect(claimer).forceWithdraw(asset.l1Token, "778787878787878")            

            const estimated = preBal + BigInt("778787878787878")
            expect(estimated).to.be.equal(await l1Token.balanceOf(asset.data[4].claimer))           
        });

        it('ForceWithdrawAll Check', async () => {
            const l1Bridge:any = await ethers.getContractAt("UpgradeL1Bridge", L1BRIDGE) 
            const zeroSigner = await ethers.getSigner(zeroAddress)
            const [deployers, ac1] = await ethers.getSigners();

            const asset1 = assets[2] // data index 2
            const asset2 = assets[1] // data index 4 
            await helpers.impersonateAccount(asset1.data[2].claimer);
            const claimer = await ethers.getSigner(asset1.data[2].claimer)

            await (await deployers.sendTransaction({
                to: claimer.address,
                value: ethers.parseEther("1")
            })).wait();

            const l1Token_1 = new ethers.Contract(asset1.l1Token, ["function balanceOf(address) view returns (uint256)"], ethers.provider)
            const l1Token_2 = new ethers.Contract(asset2.l1Token, ["function balanceOf(address) view returns (uint256)"], ethers.provider)

            const preBal1 = await l1Token_1.balanceOf(asset1.data[2].claimer)
            const preBal2 = await l1Token_2.balanceOf(asset2.data[4].claimer)

            await l1Bridge.connect(claimer).forceWithdrawAll([
                {
                    token: asset1.l1Token,
                    amount: asset1.data[2].amount
                },
                {
                    token: asset2.l1Token,
                    amount: asset2.data[4].amount
                }
            ])

            const estimated1 = preBal1 + BigInt(asset1.data[2].amount)
            const estimated2 = preBal2 + BigInt(asset2.data[4].amount)
            expect(estimated1).to.be.equal(await l1Token_1.balanceOf(asset1.data[2].claimer))
            expect(estimated2).to.be.equal(await l1Token_2.balanceOf(asset2.data[4].claimer))

            // error check 
            await expect(l1Bridge.connect(claimer).forceWithdrawAll([
                {
                    token: asset1.l1Token,
                    amount: asset1.data[2].amount
                },
                {
                    token: asset2.l1Token,
                    amount: asset2.data[5].amount
                }
            ])).to.be.revertedWith('not claimer')
        });
        
        it('VerifyRegistry Return Check', async () => {
            const l1Bridge:any = await ethers.getContractAt("UpgradeL1Bridge", L1BRIDGE) 
            const asset1 = assets[2] 
            const asset2 = assets[3]   
      
            const result = await l1Bridge.verifyRegistry([
                {
                    claimer: asset1.data[6].claimer, // do not claimed
                    key: asset1.data[6].hash
                },
                {
                    claimer: asset2.data[2].claimer, // claimed
                    key: asset2.data[2].hash
                }
            ])
            
            expect(result[0][0]).to.be.equal(zeroAddress)

        })


    }) 
    
    


});
