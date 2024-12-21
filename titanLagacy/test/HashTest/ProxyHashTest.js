const hre = require("hardhat");
const { ethers } = hre;

const UpgradeL1Bridge_ABI = require("../../../artifacts/contracts/UpgradeL1Bridge.sol/UpgradeL1Bridge.json")
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
  
  before('create fixture loader', async () => {
    const [deployer] = await ethers.getSigners();
    console.log("deployer Address : ", deployer.address)

  
  })

  describe("deploy & SetCode", () => {
    it("Deploy L1ChugSplashProxy", async () => {
      const ProxyDep = await ethers.getContractFactory("L1ChugSplashProxy")
      proxyContract = await ProxyDep.deploy(deployer.address);
      await proxyContract.deployed();
    })


    it("SetCode", async () =>{
      await proxyContract.connect(deployer).setCode(UpgradeL1Bridge_ABI.deployedBytecode);
    })
  });

});
