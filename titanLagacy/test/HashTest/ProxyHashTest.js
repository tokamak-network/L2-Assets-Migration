const hre = require("hardhat");
const { ethers } = hre;

const UpgradeL1Bridge_ABI = require("../../artifacts/contracts/UpgradeL1Bridge.sol/UpgradeL1Bridge.json")
const L1ChugSplashProxy2_ABI = require("../../artifacts/contracts/proxy/L1ChugSplashProxy2.sol/L1ChugSplashProxy2.json")
const TON_ABI = require("../../abi/TON.json")

describe("SetCdoe Test", function () {
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

    const owner2 = "0xb68aa9e398c054da7ebaaa446292f611ca0cd52b"
    await ethers.provider.send('hardhat_impersonateAccount', [
        owner2
        ]
    )
    await ethers.provider.send('hardhat_setBalance', [
        owner2, 
        '0x152D02C7E14AF6800000'
    ]);
    tester = await ethers.getSigner(owner);
    console.log("Tester1 :", tester.address);
    tester2 = await ethers.getSigner(owner2);
    console.log("Tester2 :", tester2.address);
  })

  describe("deploy & SetCode", () => {
    it("Deploy L1ChugSplashProxy", async () => {
      const L1ChugSplashProxyDep = new ethers.ContractFactory(
        L1ChugSplashProxy2_ABI.abi,
        L1ChugSplashProxy2_ABI.bytecode,
        tester
      )

      proxyContract = await L1ChugSplashProxyDep.deploy(tester.address)
      await proxyContract.deployed();
    })


    it("SetCode", async () =>{
      await proxyContract.connect(tester).setCode(UpgradeL1Bridge_ABI.deployedBytecode);
    })
  });

});
