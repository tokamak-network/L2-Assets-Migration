const hre = require("hardhat");
const { ethers } = hre;
const fs = require('fs');
const axios  = require('axios');
const { BigNumber, Signer, Contract, utils} = require("ethers")

const GenBridgeStorage1_ABI = require("../../artifacts/contracts/data2/GenBridgeStorage1.sol/GenBridgeStorage1.json")
const GenBridgeStorage2_ABI = require("../../artifacts/contracts/data2/GenBridgeStorage2.sol/GenBridgeStorage2.json")
const TON_ABI = require("../../abi/TON.json");

const { expect } = require("chai");

// mainnet
const L1BRIDGE = "0x59aa194798Ba87D26Ba6bEF80B85ec465F4bbcfD"
const L1StandardBridgeV1Abi = require("../../artifacts/contracts/UpgradeL1BridgeV1.sol/UpgradeL1BridgeV1.json")

const ownerAddress = "0xCaD132F770cFBC2B3c512C0FF35c4d9fc37476c9" // l1bridge proxy owner
const closerAddress = "0x340C44089bc45F86060922d2d89eFee9e0CDF5c7"

describe("claim Test - forking mainnet", function () {
    const proxyABI = require("../../artifacts/contracts/Proxy.sol/Proxy.json");
    // const l1BridgeABI = require("../../artifacts/contracts/UpgradeL1BridgeV1.sol/UpgradeL1BridgeV1.json");
    const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");
    let owner, closer, l1bridge;
    let GenBridgeStorage1Contract, GenBridgeStorage2Contract

    before('create fixture loader', async () => {
        await helpers.impersonateAccount(ownerAddress);
        await ethers.provider.send('hardhat_impersonateAccount', [ownerAddress])
        await ethers.provider.send('hardhat_setBalance', [ownerAddress, '0x152D02C7E14AF6800000']);
        owner  = await ethers.provider.getSigner(ownerAddress)

        await helpers.impersonateAccount(ownerAddress);
        await ethers.provider.send('hardhat_impersonateAccount', [closerAddress])
        await ethers.provider.send('hardhat_setBalance', [closerAddress, '0x152D02C7E14AF6800000']);
        closer = await ethers.provider.getSigner(closerAddress)

        const proxy = new ethers.Contract(L1BRIDGE, proxyABI.abi);
        const upgradeContract = await (await ethers.getContractFactory(L1StandardBridgeV1Abi.abi, L1StandardBridgeV1Abi.bytecode, owner)).deploy()
        await upgradeContract.deployed()

        const byteCode = await ethers.provider.getCode(upgradeContract.address)
        await proxy.connect(owner).setCode(byteCode)

        l1bridge = await ethers.getContractAt("UpgradeL1BridgeV1", L1BRIDGE)
        const _owner = await l1bridge.getProxyOwner()

        expect(await owner.getAddress()).to.be.equal(_owner)
    })

    describe("Deploy GenBridgeStorage", () => {
        it("Deploy GenBridgeStorage1", async () => {
            const GenBridgeStorage1Dep = new ethers.ContractFactory(
                GenBridgeStorage1_ABI.abi,
                GenBridgeStorage1_ABI.bytecode,
                owner
            )

            GenBridgeStorage1Contract = await GenBridgeStorage1Dep.deploy()
            await GenBridgeStorage1Contract.deployed();
        })

        it("Deploy GenBridgeStorage2", async () => {
            const GenBridgeStorage2Dep = new ethers.ContractFactory(
                GenBridgeStorage2_ABI.abi,
                GenBridgeStorage2_ABI.bytecode,
                owner
            )

            GenBridgeStorage2Contract = await GenBridgeStorage2Dep.deploy()
            await GenBridgeStorage2Contract.deployed();
        })

    });

    describe("setting the Contract", () => {

        it("set forceRegistry", async () => {
            expect( await l1bridge.position(GenBridgeStorage1Contract.address )).to.be.equal(false)

            expect( await l1bridge.position( GenBridgeStorage2Contract.address )).to.be.equal(false)

            await (await l1bridge.connect(closer).forceRegistry(
                [
                    GenBridgeStorage1Contract.address,
                    GenBridgeStorage2Contract.address
                ]
            )).wait()

            expect( await l1bridge.position(GenBridgeStorage1Contract.address)).to.be.equal(true)

            expect( await l1bridge.position(GenBridgeStorage2Contract.address)).to.be.equal(true)
        })

    })

    describe("asset claim Test", () => {
        it("claim Test", async () => {
            let readFile1 ='./data/titan_new-generate-assets.json'
            let assets
            if (await fs.existsSync(readFile1)) assets = JSON.parse(await fs.readFileSync(readFile1));

            let tokenAddr, hash, claimer, amount, position
            let tokenContract

            for(let i = 0; i < assets.length; i++) {
                tokenAddr = assets[i].l1Token
                console.log("tokenAddr : ", tokenAddr);
                if (tokenAddr == ethers.constants.AddressZero) {
                    for(let k = 0; k < assets[i].data.length; k++) {
                        if(k == 0){
                            console.log("data.length :", assets[i].data.length)
                        }
                        claimer = assets[i].data[k].claimer.toLowerCase()
                        amount = ethers.BigNumber.from(assets[i].data[k].amount)
                        hash = assets[i].data[k].hash
                        position = await l1bridge.getForcePosition(hash)

                        if(position == ethers.constants.ZeroAddress) {
                            console.log("Account : ", getAccount.address)
                            console.log("error :", hash)
                            break;
                        }

                        if(claimer != ethers.constants.AddressZero ){
                            let code = await ethers.provider.getCode(claimer);
                            if (code !== '0x') {
                                console.log("k : ", k);
                                console.log("claimer is Contract : ", claimer);
                            } else {

                                expect(await l1bridge.claimState(hash)).to.be.eq(false)
                                let beforeAmount = await ethers.provider.getBalance(claimer)
                                let receipt = await (await l1bridge.connect(owner).forceWithdrawClaim(
                                    position,
                                    hash,
                                    tokenAddr,
                                    amount,
                                    claimer
                                )).wait()

                                const topic = l1bridge.interface.getEventTopic('ForceWithdraw');
                                const log = receipt.logs.find(x => x.topics.indexOf(topic) >= 0);
                                const deployedEvent = l1bridge.interface.parseLog(log);
                                expect(deployedEvent.args._index).to.be.eq(hash)
                                expect(deployedEvent.args._token.toLowerCase()).to.be.eq(tokenAddr.toLowerCase())
                                expect(deployedEvent.args.amount).to.be.eq(amount)
                                expect(deployedEvent.args._claimer.toLowerCase()).to.be.eq(claimer)
                                expect(deployedEvent.args._requester.toLowerCase()).to.be.eq(ownerAddress.toLowerCase())

                                expect(await ethers.provider.getBalance(claimer)).to.be.eq(
                                    beforeAmount.add(amount)
                                )
                                expect(await l1bridge.claimState(hash)).to.be.eq(true)
                            }
                        }

                    }

                } else {
                    tokenContract = new ethers.Contract(
                        tokenAddr,
                        TON_ABI.abi,
                        owner
                    )
                    for(let k = 0; k < assets[i].data.length; k++) {
                        if(k == 0){
                            console.log("data.length :", assets[k].data.length)
                        }
                        claimer = assets[i].data[k].claimer.toLowerCase()
                        amount = ethers.BigNumber.from(assets[i].data[k].amount)
                        hash = assets[i].data[k].hash
                        position = await l1bridge.getForcePosition(hash)

                        if(position == ethers.constants.ZeroAddress) {
                            console.log("Account : ", getAccount.address)
                            console.log("error :", hash)
                            break;
                        }
                        if(claimer != ethers.constants.AddressZero ){
                            let code = await ethers.provider.getCode(claimer);
                            if (code !== '0x') {
                                console.log("k : ", k);
                                console.log("claimer is Contract : ", claimer);
                            } else {
                                expect(await l1bridge.claimState(hash)).to.be.eq(false)
                                let beforeAmount = await  tokenContract.balanceOf(claimer)
                                let receipt = await (await l1bridge.connect(owner).forceWithdrawClaim(
                                    position,
                                    hash,
                                    tokenAddr,
                                    amount,
                                    claimer
                                )).wait()

                                const topic = l1bridge.interface.getEventTopic('ForceWithdraw');
                                const log = receipt.logs.find(x => x.topics.indexOf(topic) >= 0);
                                const deployedEvent = l1bridge.interface.parseLog(log);
                                expect(deployedEvent.args._index).to.be.eq(hash)
                                expect(deployedEvent.args._token.toLowerCase()).to.be.eq(tokenAddr.toLowerCase())
                                expect(deployedEvent.args.amount).to.be.eq(amount)
                                expect(deployedEvent.args._claimer.toLowerCase()).to.be.eq(claimer)
                                expect(deployedEvent.args._requester.toLowerCase()).to.be.eq(ownerAddress.toLowerCase())

                                expect(await tokenContract.balanceOf(claimer)).to.be.eq(
                                    beforeAmount.add(amount)
                                )
                                expect(await l1bridge.claimState(hash)).to.be.eq(true)
                            }
                        }
                    }
                }

            }

        }).timeout(100000000);
    })

});
