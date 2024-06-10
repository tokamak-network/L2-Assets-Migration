// import { ethers as ethers2} from "ethers2";
import { expect } from "chai";
import { ethers } from "hardhat";
// import * as ethers from "ethers"
import path from 'path'
import fs from 'fs'
import { ERC20 } from "../scripts/types"
import { BigNumber } from "ethers";

export default describe('# Unit Test : L1 StandardBridge', () => {
    const proxyABI = require("../artifacts/contracts/Proxy.sol/Proxy.json");
    const l1BridgeABI = require("../artifacts/contracts/UpgradeL1Bridge.sol/UpgradeL1Bridge.json");
    const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");
    const L1BRIDGE = process.env.CONTRACTS_L1BRIDGE_ADDRESS || "";
    const L2BRIDGE = process.env.CONTRACTS_L2BRIDGE_ADDRESS || "";
    const messenger = "0xfd76ef26315Ea36136dC40Aeafb5D276d37944AE"
    const owner = "0xCaD132F770cFBC2B3c512C0FF35c4d9fc37476c9" // l1bridge proxy owner
    const forceOwner = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    const zeroAddress = ethers.constants.AddressZero

    const data = fs.readFileSync(path.join('data', 'generate-assets3.json'), "utf-8")
    const assets = JSON.parse(data)

    it('Titan L1 Bridge Upgrade Test', async () => {
        await helpers.impersonateAccount(owner);
        await ethers.provider.send('hardhat_impersonateAccount', [owner])
        await ethers.provider.send('hardhat_setBalance', [owner, '0x152D02C7E14AF6800000']);

        const deployer = await ethers.provider.getSigner(owner)
        const proxy: any = new ethers.Contract(L1BRIDGE, proxyABI.abi);

        const upgradeContract = await (await ethers.getContractFactory(l1BridgeABI.abi, l1BridgeABI.bytecode, deployer as any)).deploy()
        await upgradeContract.deployed()
        const byteCode = await ethers.provider.getCode(upgradeContract.address)

        await proxy.connect(deployer).setCode(byteCode)

        const _owner = await proxy.connect(deployer).callStatic.getOwner()
        expect(owner).to.be.equal(_owner)

        const upgradedContract = await ethers.getContractAt("UpgradeL1Bridge", L1BRIDGE)

        const _l2Bridge = await upgradedContract.l2TokenBridge()
        expect(L2BRIDGE).to.be.equal(_l2Bridge)

        const _messenger = await upgradedContract.messenger()
        expect(messenger).to.be.equal(_messenger)


    });


    it('Titan Paused Test', async () => {
        const deployer = ethers.provider.getSigner(forceOwner)
        const upgradedContract = await ethers.getContractAt("UpgradeL1Bridge", L1BRIDGE)

        await (upgradedContract.connect(deployer as any) as any).forceActive(true);
        //ETH 
        await expect(upgradedContract.depositETH(100000, ethers.utils.formatBytes32String("0x0"))).to.be.revertedWith("Paused L1StandardBridge")
        await expect(upgradedContract.depositETHTo(owner, 100000, ethers.utils.formatBytes32String("0x0"))).to.be.revertedWith("Paused L1StandardBridge")

        //ERC20 
        await expect(upgradedContract.depositERC20(zeroAddress, zeroAddress, 100000, 100000, ethers.utils.formatBytes32String("0x0"))).to.be.revertedWith("Paused L1StandardBridge")
        await expect(upgradedContract.depositERC20To(zeroAddress, zeroAddress, owner, 100000, 100000, ethers.utils.formatBytes32String("0x0"))).to.be.revertedWith("Paused L1StandardBridge")
    })


    it('Registry Check', async () => {
        const deployer = ethers.provider.getSigner(forceOwner)
        const l1Bridge: any = await ethers.getContractAt("UpgradeL1Bridge", L1BRIDGE)
        const account = await ethers.provider.getSigner(forceOwner)
        const accountAddress = await account.getAddress()

        let params: any = []
        let count = 0;
        const max = 1;

        for (const assetInfo of assets) {
            if (assetInfo.l1Token === ethers.constants.AddressZero) {
                console.log(assetInfo.tokenName, ": ", await ethers.provider.getBalance(l1Bridge.address));
            } else {
                const l1token = await ethers.getContractAt(ERC20, assetInfo.l1Token)
                console.log(assetInfo.tokenName, ": ", await l1token.balanceOf(l1Bridge.address));
            }
        }

        for (const assetInfo of assets) {

            let total = BigNumber.from(0)
            for (const asset of assetInfo.data) {
                if (asset.amount == 0) // todo : amount 0 arguments require remove function
                    continue

                if (count != max) {
                    params.push({
                        token: assetInfo.l1Token,
                        to: accountAddress,
                        amount: asset.amount,
                        index: asset.hash
                    })
                    ++count;
                }

                if (count == max) {
                    await l1Bridge.connect(deployer).forceWithdrawAll(params)
                    params.length = 0;
                    count = 0;
                }
                total = total.add(asset.amount)
            }
        }
        params.length > 0 ? await l1Bridge.connect(deployer).forceWithdrawAll(params) : ""
        for (const assetInfo of assets) {
            if (assetInfo.l1Token === ethers.constants.AddressZero) {
                console.log(assetInfo.tokenName, ": ", await ethers.provider.getBalance(l1Bridge.address));
            } else {
                const l1token = await ethers.getContractAt(ERC20, assetInfo.l1Token)
                console.log(assetInfo.tokenName, ": ", await l1token.balanceOf(l1Bridge.address));
            }
        }
        console.log("\n")
    });



});
