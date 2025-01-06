const hre = require("hardhat");
const { ethers } = hre;
const fs = require('fs');
const axios  = require('axios');
const { BigNumber } = require("ethers")

const UpgradeL1Bridge_ABI = require("../../artifacts/contracts/UpgradeL1Bridge.sol/UpgradeL1Bridge.json")
const UpgradeL1BridgeV1_ABI = require("../../artifacts/contracts/UpgradeL1BridgeV1.sol/UpgradeL1BridgeV1.json")
const UpgradeL1CrossDomainMeseenger_ABI = require("../../artifacts/contracts/UpgradeL1CrossDomainMessenger.sol/UpgradeL1CrossDomainMessenger.json")
const GenBridgeStorage1_ABI = require("../../artifacts/contracts/data2/GenBridgeStorage1.sol/GenBridgeStorage1.json")
const GenBridgeStorage2_ABI = require("../../artifacts/contracts/data2/GenBridgeStorage2.sol/GenBridgeStorage2.json")
const L1ChugSplashProxy_ABI = require("../../abi/L1ChugSplashProxy.json")
const AddressManager_ABI = require("../../abi/Lib_AddressManager.json")
const TON_ABI = require("../../abi/TON.json");

const { expect } = require("chai");

describe("V1Test (25.01.06) - forking mainnet", function () {
    const erc20ABI = [
        {
            inputs: [
            { internalType: 'address', name: '_spender', type: 'address' },
            { internalType: 'uint256', name: '_value', type: 'uint256' },
            ],
            name: 'approve',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            constant: true,
            inputs: [{ name: '_owner', type: 'address' }],
            name: 'balanceOf',
            outputs: [{ name: 'balance', type: 'uint256' }],
            type: 'function',
        },
        {
            inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
            name: 'faucet',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
            {
                internalType: 'address',
                name: 'from',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256'
            }
            ],
            name: 'transferFrom',
            outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool'
            }
            ],
            stateMutability: 'nonpayable',
            type: 'function'
        },
    ]

    // const privateKey = process.env.PRIVATE_KEY as BytesLike
    // const l1Provider = new ethers.providers.StaticJsonRpcProvider(
    //   process.env.L1_URL
    // )
    // const l1Wallet = new ethers.Wallet(privateKey, l1Provider)
    // console.log('l1Wallet :', l1Wallet.address)


    const ETH = '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000'

    const oneETH = ethers.utils.parseUnits('1', 18)
    const twoETH = ethers.utils.parseUnits('2', 18)
    const threeETH = ethers.utils.parseUnits('3', 18)
    // const fourETH = ethers.utils.parseUnits('4', 18)
    const fiveETH = ethers.utils.parseUnits('5', 18)
    const tenETH = ethers.utils.parseUnits('10', 18)
    const hundETH = ethers.utils.parseUnits('100', 18)

    const zeroAddr = '0x'.padEnd(42, '0')

    let proxyContract;
    let tester;
    let tester2;

    let execute = false;

    let multiExecutorAddr = "0x014E38eAA7C9B33FeF08661F8F0bFC6FE43f1496"
    let multiExecutor

    let BridgeOwnerAddr = "0xCaD132F770cFBC2B3c512C0FF35c4d9fc37476c9"
    let BridgeOwner

    let CloserAddr = "0x340C44089bc45F86060922d2d89eFee9e0CDF5c7"
    let closer

    let Lib_AddressManagerAddr = "0xeDf6C92fA72Fa6015B15C9821ada145a16c85571"
    let AddressManager

    let StandardBridgeProxyAddr = "0x59aa194798Ba87D26Ba6bEF80B85ec465F4bbcfD"
    let StandardBridgeProxy

    let setAddressName = "OVM_L1CrossDomainMessenger"

    let UpgradeL1BridgeProxyAddr = "0x59aa194798Ba87D26Ba6bEF80B85ec465F4bbcfD"
    let UpgradeL1BridgeLogic
    let UpgradeL1BridgeContract

    let UpgradeL1CrossDomainMessengerProxyAddr = "0xfd76ef26315Ea36136dC40Aeafb5D276d37944AE"
    let UpgradeL1CrossDomainMessengerLogic
    let UpgradeL1CrossContractAddr = "0xf3174242f55f5993701d8c8c4f4572c06f2e2538"
    let UpgradeL1CrossContract

    let GenBridgeStorage1Contract
    let GenBridgeStorage2Contract

    let GenBridgeStorage1ContractAddr = "0xcb50cacc75368026103a15d2f2a06510037813b8"
    let GenBridgeStorage2ContractAddr = "0x7b08f5f952590ffcbf3506b93f7084d0a9815a9f"

    let l1TON = "0x2be5e8c109e2197d077d13a82daead6a9b3433c5"
    let l2TON = "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2"

    let l1TOS = "0x409c4D8cd5d2924b9bc5509230d16a61289c8153"
    let l2TOS = "0xD08a2917653d4E460893203471f0000826fb4034"

    let l1USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
    let l2USDC = "0x46BbbC5f20093cB53952127c84F1Fbc9503bD6D9"

    let l1USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7"
    let l2USDT = "0x2aCC8EFEd68f07DEAaD37f57A189677fB5655B46"

    let l1ETH = "0x0000000000000000000000000000000000000000"
    let l2ETH = "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
  
    before('create fixture loader', async () => {
        const owner = "0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea"
        await ethers.provider.send('hardhat_impersonateAccount', [
                owner
            ]
        )
        await ethers.provider.send('hardhat_setBalance', [
            owner, 
            '0x152D02C7E14AF6800000'
        ]);

        tester = await ethers.getSigner(owner);
        // console.log("Tester1 :", tester.address);

        await ethers.provider.send('hardhat_impersonateAccount', [
                multiExecutorAddr
            ]
        )
        await ethers.provider.send('hardhat_setBalance', [
            multiExecutorAddr, 
            '0x152D02C7E14AF6800000'
        ]);
        multiExecutor = await ethers.getSigner(multiExecutorAddr);

        await ethers.provider.send('hardhat_impersonateAccount', [
                BridgeOwnerAddr
            ]
        )
        await ethers.provider.send('hardhat_setBalance', [
            BridgeOwnerAddr, 
            '0x152D02C7E14AF6800000'
        ]);
        BridgeOwner = await ethers.getSigner(BridgeOwnerAddr);

        await ethers.provider.send('hardhat_impersonateAccount', [
                CloserAddr
            ]
        )
        await ethers.provider.send('hardhat_setBalance', [
            CloserAddr, 
            '0x152D02C7E14AF6800000'
        ]);
        closer = await ethers.getSigner(CloserAddr);

    })

    describe("Set Contract", () => {
        it("Set Lib_AddressManager", async () => {
            AddressManager = new ethers.Contract(
                Lib_AddressManagerAddr,
                AddressManager_ABI.abi,
                tester
            )
        })

        it("Set L1StandardBridgeProxy", async () => {
            StandardBridgeProxy = new ethers.Contract(
                StandardBridgeProxyAddr,
                L1ChugSplashProxy_ABI.abi,
                tester
            )
        })

        it("Set UpgradeL1CrossDomainMessenger Contract", async () => {
            UpgradeL1CrossDomainMessengerLogic = new ethers.Contract(
                UpgradeL1CrossDomainMessengerProxyAddr,
                UpgradeL1CrossDomainMeseenger_ABI.abi,
                tester
            )
        })

        it("Set UpgradeL1BridgeLogic Contract", async () => {
            UpgradeL1BridgeLogic = new ethers.Contract(
                UpgradeL1BridgeProxyAddr,
                UpgradeL1BridgeV1_ABI.abi,
                tester
            )
        })

        it("Set GenBridgeStorage1Contract Contract", async () => {
            GenBridgeStorage1Contract = new ethers.Contract(
                GenBridgeStorage1ContractAddr,
                GenBridgeStorage1_ABI.abi,
                tester
            )
        })

        it("Set GenBridgeStorage2Contract Contract", async () => {
            GenBridgeStorage2Contract = new ethers.Contract(
                GenBridgeStorage2ContractAddr,
                GenBridgeStorage2_ABI.abi,
                tester
            )
        })

    });

    describe("setting the Contract", () => {
        it("AddressManager Check", async () => {
            let address = await AddressManager.connect(multiExecutor).getAddress(
                setAddressName
            )

            expect((UpgradeL1CrossContractAddr).toUpperCase()).to.be.equal(address.toUpperCase())
        })

        it("UpgradeL1Bridge Check the active storage", async () => {
            if(execute == false) {
                let storage = await UpgradeL1BridgeLogic.active()
                expect(storage).to.be.equal(true)
                execute = true;
            }
        })

        it("UpgradeL1Bridge l2TokenBridge && messenger", async () => {
            let messenger = "0xfd76ef26315Ea36136dC40Aeafb5D276d37944AE"
            let l2Bridge = "0x4200000000000000000000000000000000000010"

            let getL2Bridge = await UpgradeL1BridgeLogic.l2TokenBridge()
            let getMessenger = await UpgradeL1BridgeLogic.messenger()
            // console.log("getL2Bridge :", getL2Bridge)
            // console.log("getMessenger :", getMessenger)
            expect(getL2Bridge.toLowerCase()).to.be.equal(l2Bridge.toLowerCase())
            expect(getMessenger.toLowerCase()).to.be.equal(messenger.toLowerCase())
        }) 

        it("UpgradeL1Bridge getProxyOwner()", async () => {
            let getOwner = await UpgradeL1BridgeLogic.connect(tester).getProxyOwner()
            expect(getOwner).to.be.equal(BridgeOwner.address)
        })

        it("UpgradeL1Bridge getProxyImplementation()", async () => {
            let Implementation = await UpgradeL1BridgeLogic.getProxyImplementation()
            console.log("Implementation : ", Implementation)
        })

        it("UpgradeL1Bridge check setCloserAndActive", async () => {
            let closerAddr = await UpgradeL1BridgeLogic.closer()
            let storage = await UpgradeL1BridgeLogic.active()
            
            expect(closerAddr).to.be.equal(closer.address)
            expect(storage).to.be.equal(true)
        })

        // it("set forceRegistry", async () => {
        //     let addr1 = await UpgradeL1BridgeLogic.connect(closer).position(
        //         GenBridgeStorage1Contract.address
        //     )
        //     let addr2 = await UpgradeL1BridgeLogic.connect(closer).position(
        //         GenBridgeStorage2Contract.address
        //     )

        //     expect(addr1).to.be.equal(false)
        //     expect(addr2).to.be.equal(false)


        //     await UpgradeL1BridgeLogic.connect(closer).forceRegistry(
        //         [GenBridgeStorage1Contract.address,GenBridgeStorage2Contract.address]
        //     )


        //     addr1 = await UpgradeL1BridgeLogic.connect(closer).position(
        //         GenBridgeStorage1Contract.address
        //     )
        //     addr2 = await UpgradeL1BridgeLogic.connect(closer).position(
        //         GenBridgeStorage2Contract.address
        //     )

        //     expect(addr1).to.be.equal(true)
        //     expect(addr2).to.be.equal(true)
        // })

        // it("set forceModify", async () => {
        //     let forcemodifyValue = new Array();
        //     forcemodifyValue.push({
        //         "position": GenBridgeStorage1Contract.address,
        //         "state": false,
        //     })
        //     forcemodifyValue.push({
        //         "position": GenBridgeStorage2Contract.address,
        //         "state": false,
        //     })

        //     addr1 = await UpgradeL1BridgeLogic.connect(closer).position(
        //         GenBridgeStorage1Contract.address
        //     )
        //     addr2 = await UpgradeL1BridgeLogic.connect(closer).position(
        //         GenBridgeStorage2Contract.address
        //     )

        //     expect(addr1).to.be.equal(true)
        //     expect(addr2).to.be.equal(true)

        //     await UpgradeL1BridgeLogic.connect(closer).forceModify(
        //         forcemodifyValue
        //     )

        //     addr1 = await UpgradeL1BridgeLogic.connect(closer).position(
        //         GenBridgeStorage1Contract.address
        //     )
        //     addr2 = await UpgradeL1BridgeLogic.connect(closer).position(
        //         GenBridgeStorage2Contract.address
        //     )

        //     expect(addr1).to.be.equal(false)
        //     expect(addr2).to.be.equal(false)

        //     let forcemodifyValue2 = new Array();
        //     forcemodifyValue2.push({
        //         "position": GenBridgeStorage1Contract.address,
        //         "state": true,
        //     })
        //     forcemodifyValue2.push({
        //         "position": GenBridgeStorage2Contract.address,
        //         "state": true,
        //     })

        //     await UpgradeL1BridgeLogic.connect(closer).forceModify(
        //         forcemodifyValue2
        //     )

        //     addr1 = await UpgradeL1BridgeLogic.connect(closer).position(
        //         GenBridgeStorage1Contract.address
        //     )
        //     addr2 = await UpgradeL1BridgeLogic.connect(closer).position(
        //         GenBridgeStorage2Contract.address
        //     )

        //     expect(addr1).to.be.equal(true)
        //     expect(addr2).to.be.equal(true)
        // })
        
    })
    

    describe("asset claim Test", () => {
        it("claim Test", async () => {
            let readFile1 ='./data/titan_new-generate-assets.json'
            let assets
            if (await fs.existsSync(readFile1)) assets = JSON.parse(await fs.readFileSync(readFile1));

            let tokenAddr
            let Hash
            let Account
            let Amount
            let getAccount
            let getAddress
            let getClaimHash
            let testZeroAddr = "0x0000000000000000000000000000000000000000";
            let tokenContract

            let positionAddress = GenBridgeStorage1Contract.address

            for(let i = 0; i < assets.length; i++) {
                tokenAddr = assets[i].l1Token
                console.log("tokenAddr : ", tokenAddr);
                if (tokenAddr == l1ETH) {
                    for(let k = 0; k < assets[i].data.length; k++) {
                        if(k == 0){
                            console.log("data.length :", assets[i].data.length)
                        }

                        Account = assets[i].data[k].claimer
                        Amount = ethers.BigNumber.from(assets[i].data[k].amount)
                        Hash = assets[i].data[k].hash

                        getAccount = await ethers.getSigner(Account);

                        getAddress = await UpgradeL1BridgeLogic.connect(tester).getForcePosition(Hash)
                    
                        if(getAddress == testZeroAddr) {
                            console.log("Account : ", Account)
                            console.log("error :", Hash)
                            break;
                        }

                        if(Account.toUpperCase() != testZeroAddr.toUpperCase()){
                            let code = await ethers.provider.getCode(Account);
                            if (code !== '0x') {
                                console.log("k : ", k);
                                console.log("Account is Contract : ", Account);
                            } else {
                                if(Hash == "0x172665f9d91a10c9051e7851268413e8d5c31a04c6d17956ad464598a8e44969"){
                                    positionAddress = GenBridgeStorage2Contract.address
                                }

                                getClaimHash = await UpgradeL1BridgeLogic.connect(tester).claimState(Hash)
                                expect(getClaimHash).to.be.equal(false)
                                
                                // console.log("Account["+k+"] :", Account);
                                let beforeAmount = await getAccount.getBalance()
    
                                await UpgradeL1BridgeLogic.connect(tester).forceWithdrawClaim(
                                    positionAddress,
                                    Hash,
                                    tokenAddr,
                                    Amount,
                                    Account
                                )

                                let afterAmount = await getAccount.getBalance()
                                if(Number(afterAmount) <= Number(beforeAmount)) {
                                    console.log("Account["+k+"] :", Account);
                                    console.log("Hash :", Hash);
                                }
            
                                getClaimHash = await UpgradeL1BridgeLogic.connect(tester).claimState(Hash)
                                expect(getClaimHash).to.be.equal(true)
                                
                                await expect(
                                    UpgradeL1BridgeLogic.connect(tester).forceWithdrawClaim(
                                        positionAddress,
                                        Hash,
                                        tokenAddr,
                                        Amount,
                                        Account
                                    )
                                ).to.be.rejectedWith("already claim Hash")
                            }
                        } else {
                            console.log("k : ", k);
                            console.log("Account is ZeroAddr : ", Account, ", Hash :", Hash);
                        }
                    }
                } else {
                    tokenContract = new ethers.Contract(
                        tokenAddr,
                        TON_ABI.abi,
                        tester
                    ) 

                    for(let j = 0; j < assets[i].data.length; j++) {
                        if(j == 0){
                            console.log("data.length :", assets[i].data.length)
                        }
                        Account = assets[i].data[j].claimer
                        Amount = ethers.BigNumber.from(assets[i].data[j].amount)
                        Hash = assets[i].data[j].hash
                        
    
                        getAddress = await UpgradeL1BridgeLogic.connect(tester).getForcePosition(Hash)
                        
                        if(getAddress == testZeroAddr) {
                            console.log("Account : ", Account)
                            console.log("error :", Hash)
                            break;
                        }
             
                        if(Account.toUpperCase() != testZeroAddr.toUpperCase()){
                            let code = await ethers.provider.getCode(Account);
                            if (code !== '0x') {
                                console.log("j : ", j);
                                console.log("Account is Contract : ", Account);
                            } else {
                                if(Hash == "0x172665f9d91a10c9051e7851268413e8d5c31a04c6d17956ad464598a8e44969"){
                                    positionAddress = GenBridgeStorage2Contract.address
                                }

                                getClaimHash = await UpgradeL1BridgeLogic.connect(tester).claimState(Hash)
                                expect(getClaimHash).to.be.equal(false)
    
                                let beforeAmount = await tokenContract.balanceOf(Account)
    
                                await UpgradeL1BridgeLogic.connect(tester).forceWithdrawClaim(
                                    positionAddress,
                                    Hash,
                                    tokenAddr,
                                    Amount,
                                    Account
                                )
            
                                let afterAmount = await tokenContract.balanceOf(Account)
                                
                                expect(afterAmount).to.be.gt(beforeAmount)

                                getClaimHash = await UpgradeL1BridgeLogic.connect(tester).claimState(Hash)
                                expect(getClaimHash).to.be.equal(true)

                                await expect(
                                    UpgradeL1BridgeLogic.connect(tester).forceWithdrawClaim(
                                        positionAddress,
                                        Hash,
                                        tokenAddr,
                                        Amount,
                                        Account
                                    )
                                ).to.be.rejectedWith("already claim Hash")
                            }
                        }
            
                    }
                }

            }

        }).timeout(100000000);
    })

});
