import { ethers } from "hardhat";
import { expect } from "chai";

// sepolia
const L1BRIDGE = "0x1F032B938125f9bE411801fb127785430E7b3971"
const L1StandardBridgeV1Abi = require("../../artifacts/contracts/UpgradeL1BridgeV1.sol/UpgradeL1BridgeV1.json")

const owner = "0x37212a8F2abbb40000e974DA82D410DdbecFa956" // l1bridge proxy owner
const ERC20Abi = require("../../abi/TON.json")


// sepolia test
const test1_already_claimed = {
    hash: '0x9ec2f00e422a095a3bbddc1f8732ee9c84fca67499d8ee21cb02f9f4d02b7c88',
    token: '0xFF3Ef745D9878AfE5934Ff0b130868AFDDbc58e8',
    amount: '12000000000000000000',
    claimer: '0x757DE9c340c556b56f62eFaE859Da5e08BAAE7A2'
}
const test2_eth = {
    hash: '0x946fda2cf90bda4739dce26cf41c16776e462618b3752e9645a05bb5512e2781',
    token: '0x0000000000000000000000000000000000000000',
    amount: '105899999967584534',
    claimer: '0x757DE9c340c556b56f62eFaE859Da5e08BAAE7A2'
}

const test3_ton = {
    hash: '0x1375ce99bbadf6fc660c9552ff2aa9df4d552c811229b332ede22c2875feff15',
    token: '0xa30fe40285B8f5c0457DbC3B7C8A280373c40044',
    amount: '910000000000000000000',
    claimer: '0xbd5c6a99b97ef79f4bee97bc1a6597683b397579'
}

export default describe('# L1StandardBridge forceWithdrawClaim Test', () => {
    const proxyABI = require("../../artifacts/contracts/Proxy.sol/Proxy.json");
    const l1BridgeABI = require("../../artifacts/contracts/UpgradeL1BridgeV1.sol/UpgradeL1BridgeV1.json");
    const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

    it('Titan L1 Bridge Upgrade Test', async () => {
        await helpers.impersonateAccount(owner);
        await ethers.provider.send('hardhat_impersonateAccount', [owner])
        await ethers.provider.send('hardhat_setBalance', [owner, '0x152D02C7E14AF6800000']);

        const deployer = await ethers.provider.getSigner(owner)
        const proxy: any = new ethers.Contract(L1BRIDGE, proxyABI.abi);

        const upgradeContract = await (await ethers.getContractFactory(L1StandardBridgeV1Abi.abi, L1StandardBridgeV1Abi.bytecode, deployer as any)).deploy()

        await upgradeContract.deployed()

        const byteCode = await ethers.provider.getCode(upgradeContract.address)
        await proxy.connect(deployer).setCode(byteCode)

        const _owner = await proxy.connect(deployer).callStatic.getOwner()
        expect(owner).to.be.equal(_owner)
    });

    it('forceWithdrawClaim: test1_already_claimed', async () => {
        const test = test1_already_claimed
        const l1bridge = await ethers.getContractAt("UpgradeL1BridgeV1", L1BRIDGE)

        const state = await l1bridge.active();
        await expect(state).to.be.eq(true)
        let position = await l1bridge.getForcePosition(test.hash)
        await expect(
            l1bridge.forceWithdrawClaim(position, test.hash, test.token, test.amount, test.claimer)
        ).to.be.rejectedWith("already claim Hash")
    });

    it('forceWithdrawClaim: test2_eth', async () => {
        const test = test2_eth
        const l1bridge = await ethers.getContractAt("UpgradeL1BridgeV1", L1BRIDGE)
        expect(await l1bridge.claimState(test.hash)).to.be.eq(false)

        let position = await l1bridge.getForcePosition(test.hash)

        let prevBalance = await ethers.provider.getBalance(test.claimer)

        await l1bridge.forceWithdrawClaim(position, test.hash, test.token, test.amount, test.claimer)

        expect(await l1bridge.claimState(test.hash)).to.be.eq(true)

        expect( await ethers.provider.getBalance(test.claimer))
        .to.be.eq(ethers.BigNumber.from(""+prevBalance.toString()).add(ethers.BigNumber.from(test.amount)))
    });

    it('forceWithdrawClaim: test3_ton', async () => {
        const test = test3_ton
        const l1bridge = await ethers.getContractAt("UpgradeL1BridgeV1", L1BRIDGE)
        const TON = await ethers.getContractAt(ERC20Abi.abi, test.token)

        expect(await l1bridge.claimState(test.hash)).to.be.eq(false)

        let position = await l1bridge.getForcePosition(test.hash)
        let prevBalance = await TON.balanceOf(test.claimer)

        await l1bridge.forceWithdrawClaim(position, test.hash, test.token, test.amount, test.claimer)

        expect(await l1bridge.claimState(test.hash)).to.be.eq(true)

        expect( await TON.balanceOf(test.claimer))
        .to.be.eq(ethers.BigNumber.from(""+prevBalance.toString()).add(ethers.BigNumber.from(test.amount)))
    });

    it('forceWithdrawClaim: already claimed Hash', async () => {
        const test = test3_ton
        const l1bridge = await ethers.getContractAt("UpgradeL1BridgeV1", L1BRIDGE)

        let position = await l1bridge.getForcePosition(test.hash)

        await expect(
            l1bridge.forceWithdrawClaim(position, test.hash, test.token, test.amount, test.claimer)
        ).to.be.rejectedWith("already claim Hash")
    });


});
