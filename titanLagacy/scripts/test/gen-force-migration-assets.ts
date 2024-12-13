import fs from 'fs'
import path from 'path'
import { ethers } from 'hardhat'
import { BigNumber } from "ethers"
import { NonfungibleTokenPositionManager, L2Interface, ERC20, L1Interface, Pool, Closed, User, WithdrawClaimed } from '../types';
import { red, green, white, blue, } from 'console-log-colors';
import { getWithdrawalClaimStatus, getCollectWETH, getTotalAddressAll, getContractAll, bigNumberAbs } from "../forceLib";
import * as dotenv from 'dotenv';

/* 
// Before collecting a collection, you need to do some preliminary work.
// 1. Forking target : L2 RpcUrl   
// 2. Env Set : L1rpc, L2rpc, L1bridgeAddress, L2bridgeAddress
// 3. Optinal Arg : startblock, endblock 
// * (Caution): In order to accurately count withdrawals, you must at least check the withdrawal request list in the OP SDK.

// * The asset collection protocol is divided into three steps.
// * The first is to collect EOA wallet and contract addresses and assets
// * The second is to separate and collect assets in the UniswapV3 Pool.
// * Finally, the process is completed by collecting the above two and removing duplicates.
// * The files created vary depending on each step. For tasks that take a long time, 
// * it is possible to respond to failures through IO operations.
*/
const L1PROVIDER = new ethers.providers.JsonRpcProvider(process.env.CONTRACT_RPC_URL_L1 || ""); // L1 RPC URL
const L2PROVIDER = new ethers.providers.JsonRpcProvider(process.env.CONTRACT_RPC_URL_L2 || ""); // L2 RPC URL
const L1BRIDGE = process.env.CONTRACTS_L1BRIDGE_ADDRESS || ""; // L1 bridge address
const L2BRIDGE = process.env.CONTRACTS_L2BRIDGE_ADDRESS || ""; // L2 bridge address
const DEAD_MAX = Math.floor(Date.now() / 1000) + 1200
const WETH = process.env.L2_WETH_ADDRESS || ""
const ETH = process.env.L2_ETH_ADDRESS || ""

let out: Closed; // export assets data
const dirPath = "data"
const outPool: any[] = [];
const verifyL2Balance = new Map<any, any>(); // L2 token address : totalSupply
let L1TokenContracts: any = []; // L1 tokens contracts address 
let tokenMapper: any // L1 -> L2 token address mapping 
let etheoa_str: any[];
let ethpool: any[];
let ethca: any[];
let contractAllInToken: any = [];

const getBlock = async () => {
  const L1_StartBlock = process.env.L1_START_BLOCK || 0;
  const L1_EndBlock = process.env.L1_END_BLOCK || await L1PROVIDER.getBlockNumber();
  const L2_StartBlock = process.env.L2_START_BLOCK || 0;
  const L2_EndBlock = process.env.L2_END_BLOCK || await L2PROVIDER.getBlockNumber();
  return [L1_StartBlock, L1_EndBlock, L2_StartBlock, L2_EndBlock];
}

const main = async () => {
  const [STBLOCK, ENBLOCK, L2STBLOCK, L2ENDBLOCK] = await getBlock();
  const L2TokenContracts: any = [];
  const l2BridgeContracts = new ethers.Contract(L2BRIDGE, L2Interface, L2PROVIDER);
  const l1BridgeContracts = new ethers.Contract(L1BRIDGE, L1Interface, L1PROVIDER);

  out = {
    L1startBlock: STBLOCK,
    L1endBlock: await L1PROVIDER.getBlockNumber(),
    L2startBlock: STBLOCK,
    L2endBlock: ENBLOCK,
    data: []
  }

  // get deposited evnets 
  let eventName = l2BridgeContracts.filters.DepositFinalized();

  const events: any = await l2BridgeContracts.queryFilter(eventName, L2STBLOCK, L2ENDBLOCK);
  if (events.length === 0 || events === undefined) {
    console.log('does not exit asset events');
    process.exit(1);
  }

  for (const event of events) {
    if (event.args !== undefined) {
      L2TokenContracts.push(
        {
          l1: event.args[0],
          l2: event.args[1],
        }
      )
      L1TokenContracts.push(event.args[0])
    }
  }

  L1TokenContracts = Array.from(new Set(L1TokenContracts))

  tokenMapper = L2TokenContracts.reduce((map: any, pair: any) => {
    const key = pair.l1;
    if (!map.has(key)) {
      map.set(key, pair.l2);
    }
    return map;
  }, new Map<any, any>())
  console.log(blue.bgGreen.bold.underline("L1 : L2 Assets Address List :"))
  console.log(tokenMapper, '\n')


  console.log(blue.bgGreen.bold.underline("1st : Check L2 withdrawal volumes"))
  for (const contract of L1TokenContracts) {
    // L1 deposit
    let v: BigNumber
    if (contract === ethers.constants.AddressZero) { // ETH  
      v = await L1PROVIDER.getBalance(L1BRIDGE)
    } else  // other ERC20        
      v = await l1BridgeContracts.deposits(contract, tokenMapper.get(contract))

    // L2 totalSupply()
    const l2Token = new ethers.Contract(tokenMapper.get(contract), ERC20, L2PROVIDER);
    const l2Balance = await l2Token.totalSupply();
    
    console.log(await l2Token.name(), "L1 : ", v.toString(), "(-",0, ") L2 : ", l2Balance.toString(), ' : ', blue('MATCH ✅'))
     
    verifyL2Balance.set(tokenMapper.get(contract), l2Balance)
  }

  console.log(blue.bgGreen.bold.underline("\n Collect L2 wallets and Check Assets holdings"))
  for (let i = 0; i < L1TokenContracts.length; i++) {
    let totalAddress: any = [];
    let totalBalance = BigNumber.from(0);
    const data: User[] = [];
    const l2Token = new ethers.Contract(tokenMapper.get(L1TokenContracts[i]), ERC20, L2PROVIDER);
    const l2TokenName = await l2Token.name();

    eventName = l2Token.filters.Transfer();
    const transferEvent: any = await l2Token.queryFilter(eventName, 0, 'latest');
    for (const event of transferEvent) {
      if (event.args !== undefined) {
        totalAddress.push(event.args[0])
        totalAddress.push(event.args[1])
      }
    }

    // API query, now pool is not exist
    if (L1TokenContracts[i] === ethers.constants.AddressZero) {
      totalAddress.length = 0
      totalAddress = etheoa_str
    }

    totalAddress = Array.from(new Set(totalAddress)) // deduplication
    for (const address of totalAddress) {
      const amount = await l2Token.balanceOf(address);
      if (amount === 0)
        continue;

      totalBalance = totalBalance.add(amount)// total balance  update
      if (await L2PROVIDER.getCode(address) === '0x') { // outPool
        data.push({
          claimer: address,
          amount: amount.toString(),
          type: 0 // 0 : eoa
        })
      } else {
        outPool.push({
          claimer: address,
          amount: amount.toString(),
          type: i,  // outPool array index 
          l2Token: tokenMapper.get(L1TokenContracts[i])
        })
      }
    }

    console.log('⦿ Withdrawal L2 Token Info : ', tokenMapper.get(L1TokenContracts[i]), ' Name: ', l2TokenName)

    if (verifyL2Balance.get(tokenMapper.get(L1TokenContracts[i])).toString() == totalBalance.toString()) {
      console.log('Withdrawal L2 Balance    : ', verifyL2Balance.get(tokenMapper.get(L1TokenContracts[i])).toString(), ' Collected L2 Balance: ', totalBalance.toString(), blue(' MATCH ✅ \n'))
    } else if (L1TokenContracts[i] === ethers.constants.AddressZero) { // case1. ether 
      let otherCaETH: BigNumber = BigNumber.from(0);
      let count = 0;
      ethca.map((item: any) => {
        otherCaETH = otherCaETH.add(BigNumber.from(item.amount))
        count++;
      })
      if (verifyL2Balance.get(tokenMapper.get(L1TokenContracts[i])).toString() == otherCaETH.add(totalBalance).toString()) {
        console.log('Withdrawal L2 Balance    : ', verifyL2Balance.get(tokenMapper.get(L1TokenContracts[i])).toString(), ' Collected L2 Balance: ', totalBalance.toString(), "(+", otherCaETH.toString(), ")", blue(' MATCH ✅'))
        console.log('Other ETH hold L2 Contract Count : ', count, "\n")
      } else
        console.log('Withdrawal L2 Balance: ', verifyL2Balance.get(tokenMapper.get(L1TokenContracts[i])).toString(), ' Collected L2 Balance: ', totalBalance.toString(), "(+", otherCaETH.toString(), ")", blue(' MISMATCH ❌ \n'))
    } else {
      console.log('Withdrawal L2 Balance: ', verifyL2Balance.get(tokenMapper.get(L1TokenContracts[i])).toString(), ' Collected L2 Balance: ', totalBalance.toString(), blue(' MISMATCH ❌ \n'))
    }

    verifyL2Balance.set(tokenMapper.get(L1TokenContracts[i]), totalBalance)

    out.data.push({
      l1Token: L1TokenContracts[i],
      l2Token: tokenMapper.get(L1TokenContracts[i]),
      tokenName: await l2Token.name(),
      data
    })
  }

  fs.mkdir(dirPath, { recursive: true }, (err) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    fs.writeFile(path.join(dirPath, 'sepolia-generate-assets1.json'), JSON.stringify(out, null, 1), 'utf-8', (err) => {
      if (err) {
        console.log(err);
        process.exit(1);
      }
    })
    console.log(blue.bgBlue.bold("📝 Generate 'sepolia-assets1.json' File complete!"))
    console.log("\n")
  })
  
  await convertToContractData();
}

// json --> contract registry data
const convertToContractData = async () => {
  let jsonData = fs.readFileSync(path.join(dirPath, 'sepolia-generate-assets1.json'), "utf-8")
  let assetsData = JSON.parse(jsonData)
  const outContract = [];

  // keccak256(abi.encodePacked(_token, _claimer, _amount));
  for (const data of assetsData.data) {
    const inner = {
      l1Token: data.l1Token,
      l2Token: data.l2Token,
      tokenName: data.tokenName,
      data: new Array()
    }
    for (const userData of data.data) {
      inner.data.push({
        "claimer": userData.claimer,
        "amount": userData.amount,
        "hash": ethers.utils.solidityKeccak256(['address', 'address', 'uint256'], [data.l1Token, userData.claimer, userData.amount])
      })
    }
    outContract.push(inner)
  }
  fs.writeFile(path.join(dirPath, 'sepolia-generate-assets3.json'), JSON.stringify(outContract, null, 1), 'utf-8', (err) => {
    if (err) {
      console.log(err);
    }
  })
}


main().catch((error) => {
  console.log(error)
  process.exit(1);
})
