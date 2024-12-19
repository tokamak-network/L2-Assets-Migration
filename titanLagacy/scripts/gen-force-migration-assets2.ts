import fs from 'fs'
import path from 'path'
import { ethers } from 'hardhat'
import { BigNumber } from "ethers"
import { NonfungibleTokenPositionManager, L2Interface, ERC20, L1Interface, Pool, Closed, User, WithdrawClaimed } from './types';
import { red, green, white, blue, } from 'console-log-colors';
import { getWithdrawalClaimStatus, getCollectWETH, getTotalAddressAll, getContractAll,getContractAll2, bigNumberAbs } from "./forceLib";

const L1PROVIDER = new ethers.providers.JsonRpcProvider(process.env.CONTRACT_RPC_URL_L1 || ""); // L1 RPC URL
const L2PROVIDER = new ethers.providers.JsonRpcProvider(process.env.CONTRACT_RPC_URL_L2 || ""); // L2 RPC URL
const L1BRIDGE = process.env.CONTRACTS_L1BRIDGE_ADDRESS || ""; // L1 bridge address
const L2BRIDGE = process.env.CONTRACTS_L2BRIDGE_ADDRESS || ""; // L2 bridge address
const DEAD_MAX = Math.floor(Date.now() / 1000) + 1200
const WETH = process.env.L2_WETH_ADDRESS || ""
const ETH = process.env.L2_ETH_ADDRESS || ""
const v3PoolDeployer = "0x340c44089bc45f86060922d2d89efee9e0cdf5c7"
const ca = []; // ca
const caOwners = new Map([
  [ethers.utils.getAddress("0x6C541EC59b29e715DB5b432e9E6bB973a79965ef".toLowerCase()), ethers.utils.getAddress("0x340c44089bc45f86060922d2d89efee9e0cdf5c7".toLowerCase())], // CA_MULTI_SIG // master
  [ethers.utils.getAddress("0x8cE29b23c188C09f0BcF66f5851AeB82220F04e1".toLowerCase()), ethers.utils.getAddress("0xb68aa9e398c054da7ebaaa446292f611ca0cd52b".toLowerCase())], // CA_CTYPTO_DICE // owner 
  [ethers.utils.getAddress("0x129286C288228a462b107a526182Bc91DA7E3357".toLowerCase()), ethers.utils.getAddress("0xbc5a1e5833dac6ce165c26f44c8b51284df53391".toLowerCase())], // CA_TRANSPARENT_PROXY // owner 
])
const eoaOwners = new Map([
  [ethers.utils.getAddress("0x4200000000000000000000000000000000000006".toLowerCase()), ethers.utils.getAddress("0x6e1a64b7496DF60bF747085E89e1231A717fDd38".toLowerCase())], // WETH ca // kevin
  [ethers.utils.getAddress("0x4200000000000000000000000000000000000011".toLowerCase()), ethers.utils.getAddress("0x6e1a64b7496DF60bF747085E89e1231A717fDd38".toLowerCase())], // CA_CTYPTO_DICE // owner 
  [ethers.utils.getAddress("0x78acca4e8269e6082d1c78b7386366feb7865fb4".toLowerCase()), ethers.utils.getAddress("0xb68aa9e398c054da7ebaaa446292f611ca0cd52b".toLowerCase())], // DRB // owner 
  [ethers.utils.getAddress("0xd6e99ec486afc8ae26d36a6ab6240d1e0ecf0271".toLowerCase()), ethers.utils.getAddress("0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea".toLowerCase())], // L2CrossTradeProxy // deployer and default admin role 
])

let out: Closed; // export assets data
const dirPath = "data"
const outPool: any[] = [];
const verifyL2Balance = new Map<any, any>(); // L2 token address : totalSupply
let L1TokenContracts: any = []; // L1 tokens contracts address 
let tokenMapper: any // L1 -> L2 token address mapping 
let etheoa_str: any[];
let ethpool: any[];
let ethca: any[];
let otherCaETH: BigNumber = BigNumber.from(0);
let contractAllInToken: any = [];

const getBlock = async () => {
  const L1_StartBlock = process.env.L1_START_BLOCK || 0;
  const L1_EndBlock = process.env.L1_END_BLOCK || await L1PROVIDER.getBlockNumber();
  const L2_StartBlock = process.env.L2_START_BLOCK || 0;
  const L2_EndBlock = process.env.L2_END_BLOCK || await L2PROVIDER.getBlockNumber();
  return [L1_StartBlock, L1_EndBlock, L2_StartBlock, L2_EndBlock];
}

const runChecker = () => {
  if (L1BRIDGE == "" || undefined) {
    console.log(red('env Error : Bridge address is not set. \n'));
    process.exit(1);
  }
  if (L2BRIDGE == "" || undefined) {
    console.log(red('env Error : Bridge address is not set. \n'));
    process.exit(1);
  }
  if (process.env.CONTRACT_RPC_URL_L1 == "" || undefined) {
    console.log(red('env Error : L1 RPC URL is not set. \n'));
    process.exit(1);
  }
  if (process.env.CONTRACT_RPC_URL_L2 == "" || undefined) {
    console.log(red('env Error : L2 RPC URL is not set. \n'));
    process.exit(1);
  }
  if (process.env.CONTRACTS_NONFUNGIBLE_ADDRESS == "" || undefined) {
    console.log(red('env Error : L2 NONFUNGIBLE is not set. \n'));
    process.exit(1);
  }
}



const main = async () => {
  
  runChecker();
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

  // API total ethereumscan info
  const results = await getTotalAddressAll(1, 10000, true)
  ethpool = results[1]
  ethca = results[2]
  etheoa_str = results[3]
  console.log('\n')

  
  const withdrawClaimed: WithdrawClaimed[] = [];
  // get L2 initWithdrawalclaim data 
  let l2WithdrawClaimed: any = [];
  try {
    l2WithdrawClaimed = JSON.parse(fs.readFileSync(path.join(dirPath, 'generate-WithdrawalClaim.json'), "utf-8"))
  } catch (err) {
    let eventName = l2BridgeContracts.filters.WithdrawalInitiated();
    const events: any = await l2BridgeContracts.queryFilter(eventName, L2STBLOCK, L2ENDBLOCK); // todo : When L2 transaction volumes get high, you need to split events to collect them
    for (const event of events) {
      if (event.args !== undefined) {
        withdrawClaimed.push(
          {
            txHash: event.transactionHash,
            event: {
              l1Token: event.args[0],
              l2Token: event.args[1],
              from: event.args[2],
              to: event.args[3],
              amount: event.args[4],
              data: event.args[5]
            }
          }
        )
      }
    }
  
    l2WithdrawClaimed = await getWithdrawalClaimStatus(withdrawClaimed, { 
      l1ChainId: process.env.L1_CHAINID as any || 0,
      l2ChainId: process.env.L2_CHAINID as any || 0,
      save: true,
      target: true, // false == testnet, true == mainnet
    })
    // console.log(red('generate-WithdrawalClaim.json is not exist. \n'));
    // process.exit(1);
  }

  // total l2 isNotClaimeAll amount
  const isNotClaimeAll: any = new Map<any, any>();
  l2WithdrawClaimed.map((item: any) => {
    if (!item.isClaimedAll) {
      isNotClaimeAll.set(item.event.l1Token, isNotClaimeAll.get(item.event.l1Token) ? isNotClaimeAll.get(item.event.l1Token).add(BigNumber.from(item.event.amount)) : BigNumber.from(item.event.amount))
    }
  })


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
      v = await L1PROVIDER.getBalance(L1BRIDGE) // 이거 문제있다.. 그냥 전송한 물량일수도있자나 .. ㅠ 
    } else  // other ERC20        
      v = await l1BridgeContracts.deposits(contract, tokenMapper.get(contract))

    // L2 totalSupply()
    const l2Token = new ethers.Contract(tokenMapper.get(contract), ERC20, L2PROVIDER);
    const l2Balance = await l2Token.totalSupply();
    const vv = isNotClaimeAll.get(contract) ? BigNumber.from(isNotClaimeAll.get(contract)).sub(v).mul(-1) : v

    if (vv.toString() === l2Balance.toString()) {
      console.log(await l2Token.name(), "L1 : ", v.toString(), "(-", isNotClaimeAll.get(contract) ? isNotClaimeAll.get(contract).toString() : 0, ") L2 : ", l2Balance.toString(), ' : ', blue('MATCH ✅'))
    } else if (vv > l2Balance) {
      console.log(await l2Token.name(), "L1 : ", v.toString(), "(-", isNotClaimeAll.get(contract) ? isNotClaimeAll.get(contract).toString() : 0, ") L2 : ", l2Balance.toString(), ' : ', red('L1 > L2 🟠'))
    } else {
      console.log(await l2Token.name(), "L1 : ", v.toString(), "(-", isNotClaimeAll.get(contract) ? isNotClaimeAll.get(contract).toString() : 0, ") L2 : ", l2Balance.toString(), ' : ', red('ISSUE ❌'))
    }
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
      totalAddress = totalAddress.concat(etheoa_str)
    }

    totalAddress = Array.from(new Set(totalAddress)) // deduplication

    for (const address of totalAddress) {
      const amount = await l2Token.balanceOf(address);
      if (amount === 0)
        continue;

      totalBalance = totalBalance.add(amount)// total balance  update
      
      if (await L2PROVIDER.getCode(address) === '0x') { // outPool
        // 이게 제일 중요함 여기서 주소가 다일치하거든 
        data.push({ 
          claimer: address,
          amount: amount.toString(),
          type: 0 // 0 : eoa
        })
      } else { // ca contacts + (include v3pool)
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
    fs.writeFile(path.join(dirPath, 'generate-assets1.json'), JSON.stringify(out, null, 1), 'utf-8', (err) => {
      if (err) {
        console.log(err);
        process.exit(1);
      }
    })
    console.log(blue.bgBlue.bold("📝 Generate 'assets1.json' File complete!"))
    console.log("\n")
  })

  await collectPool();
}

// v3 pool collect
const collectPool = async () => {
  if (outPool.length == 0) {
    console.log('Not exist pool, Complete!')
    return;
  }

  // deduplication & clear
  const rebaseOutPool = [...new Set(outPool.map(outPool => outPool.claimer))]; // pool ca 
 
  const nonFungibleContractAddress = process.env.CONTRACTS_NONFUNGIBLE_ADDRESS!;
  const nonFungibleContract = new ethers.Contract(nonFungibleContractAddress, NonfungibleTokenPositionManager, L2PROVIDER);
  const _outPool = new Map<any, any[]>(); // token address : { claimer : address, amount : string }[]
  console.log(white.bgGreen.bold("Collecting Pool Data...."))

  // collecting pool 
  for (const p of rebaseOutPool) {
    const poolContract = new ethers.Contract(p, Pool, L2PROVIDER);
    const outToken0: any = [];
    const outToken1: any = [];

    // todo : Requires non-V3 full contract handling.
    try {
      if(await poolContract.token0() != undefined && await poolContract.token1() != undefined) {
        // 0x340c44089bc45f86060922d2d89efee9e0cdf5c7 해당 계정으로 편입 (메인넷 기준)
        
        if (await poolContract.liquidity() == 0){
          const _token0 = await poolContract.token0()
          const _token1 = await poolContract.token1()

          const _outToken0 = _outPool.get(_token0);
          const _outToken1 = _outPool.get(_token1);

          const token0Contract = new ethers.Contract(_token0, ERC20, L2PROVIDER);
          const token1Contract = new ethers.Contract(_token1, ERC20, L2PROVIDER);

          outToken0.push({
            claimer: v3PoolDeployer,
            amount: await token0Contract.balanceOf(p)
          }) 
          outToken1.push({
            claimer: v3PoolDeployer,
            amount: await token1Contract.balanceOf(p)
          })

          outToken0.length > 0 ? _outPool.set(_token0, _outToken0 ? _outToken0.concat(outToken0) : outToken0) : ""
          outToken1.length > 0 ? _outPool.set(_token1, _outToken1 ? _outToken1.concat(outToken1) : outToken1) : ""
          continue;
        }
      }
    } catch (err) { 
      ca.push(p)
      continue; 
    }

    let maxIndex = await nonFungibleContract.totalSupply();
    const token0Address = await poolContract.token0();
    const token1Address = await poolContract.token1();
    const token0Contract = new ethers.Contract(token0Address, ERC20, L2PROVIDER);
    const token1Contract = new ethers.Contract(token1Address, ERC20, L2PROVIDER);
    const token0Name = await token0Contract.symbol()
    const token1Name = await token1Contract.symbol()

    let tokenids: any = []; // token ids
    const poolFee = await poolContract.fee()
    const totalMap = new Map<any, any>(); // total amount (token address => amount)

    let total0 = BigNumber.from(0);
    let total1 = BigNumber.from(0);
    // CheckPoint: Check if you can withdraw less than the amount the pool has.
    console.log("💧 Pool Info Address: ", p, " Pair: ", token0Name, '/', token1Name, 'Pool Fee: ', poolFee)
    // Check all NFT positions, script delay points 
    // todo : Searched positions should be managed as a 'Map' to avoid duplicates 
    for (let i = 1; i <= maxIndex; i++) {
      const _position = await nonFungibleContract.positions(i)

      // check pool
      if (_position.liquidity != 0x00 && _position.token0 == token0Address && _position.token1 == token1Address && poolFee == _position.fee) {
        const _owner = await nonFungibleContract.ownerOf(i)
        tokenids.push({
          tokenId: i,
          owner: _owner
        })
        const tx1 = await nonFungibleContract.callStatic.decreaseLiquidity({
          tokenId: i,
          liquidity: _position.liquidity,
          amount0Min: 0,
          amount1Min: 0,
          deadline: DEAD_MAX,
        })
        const tx2 = await nonFungibleContract.callStatic.collect({
          tokenId: i,
          recipient: _owner,
          amount0Max: 2n ** 128n - 1n,
          amount1Max: 2n ** 128n - 1n,
        });
        const amount0: BigNumber = BigNumber.from(tx1.amount0).add(BigNumber.from(tx2.amount0));
        const amount1: BigNumber = BigNumber.from(tx1.amount1).add(BigNumber.from(tx2.amount1));
        totalMap.set(token0Address, totalMap.get(token0Address) ? totalMap.get(token0Address).add(amount0) : amount0)
        totalMap.set(token1Address, totalMap.get(token1Address) ? totalMap.get(token0Address).add(amount1) : amount1)
        total0 = total0.add(amount0)
        total1 = total1.add(amount1)
        // set data 
        Number(amount0) > 0 ? outToken0.push({
          claimer: _owner,
          amount: amount0.toString()
        }) : ""
        Number(amount1) > 0 ? outToken1.push({
          claimer: _owner,
          amount: amount1.toString()
        }) : ""
      }
    }
    console.log('Pool Amount token0: ', ethers.utils.formatUnits(await (await token0Contract.balanceOf(p)), await token0Contract.decimals()), ' Pool State: ', (await token0Contract.balanceOf(p)) >= total0 ? green('MATCH ✅') : red('MISMATCH ❌'))
    console.log('Withdraw Available Total Token0: ', ethers.utils.formatUnits(total0.toString(), await token0Contract.decimals()))
    console.log('Pool Amount token1: ', ethers.utils.formatUnits(await (await token1Contract.balanceOf(p)), await token1Contract.decimals()), ' Pool State: ', (await token1Contract.balanceOf(p)) >= total1 ? green('MATCH ✅') : red('MISMATCH ❌'))
    console.log('Withdraw Available Total Token1: ', ethers.utils.formatUnits(total1.toString(), await token1Contract.decimals()), '\n')

    // Remaining pool asset withdrawal
    const remaining0: BigNumber = BigNumber.from(await (await token0Contract.balanceOf(p))).sub(total0);
    const remaining1: BigNumber = BigNumber.from(await (await token1Contract.balanceOf(p))).sub(total1);
    console.log('Reamining Token0: ', remaining0)
    console.log('Reamining Token1: ', remaining1, '\n')

    Number(remaining0) > 0 ? outToken0.push({
      claimer: v3PoolDeployer,
      amount: remaining0.toString()
    }) : ""
    Number(remaining1) > 0 ? outToken1.push({
      claimer: v3PoolDeployer,
      amount: remaining1.toString()
    }) : ""

    // Collected WETH , data binding
    const _outToken0 = _outPool.get(token0Address);
    const _outToken1 = _outPool.get(token1Address);
    outToken0.length > 0 ? _outPool.set(token0Address, _outToken0 ? _outToken0.concat(outToken0) : outToken0) : ""
    outToken1.length > 0 ? _outPool.set(token1Address, _outToken1 ? _outToken1.concat(outToken1) : outToken1) : ""
  }
  
  
  // pool 에서 수집한 자산 하나의 계정으로 통합
  // Sum and pack the collected pool data.
  // WETH asset colleting 
  const packPool: any = [];
  for (const l1Token of L1TokenContracts) {
    //  풀에서 수집된 WETH를 ETH로 변경해서 저장
    const l2Token = l1Token === ethers.constants.AddressZero ? WETH : tokenMapper.get(l1Token);

    if (_outPool.has(l2Token) === false)
      continue;

    const l2Pool = _outPool.get(l2Token);
    const sumPool = l2Pool?.reduce((acc: Map<string, string>, { claimer, amount }) => {
      if (acc.has(claimer)) {
        const current: any = acc.get(claimer)
        acc.set(claimer, (BigInt(current) + BigInt(amount)).toString())
      } else {
        acc.set(claimer, amount)
      }
      return acc;
    }, new Map<string, string>())

    const entries = Array.from(sumPool!.entries())

    packPool.push({
      l2Token: l2Token,
      user: entries.map(([claimer, amount]) => ({ claimer, amount, type: 1 })),
    })
  }

  // WETH 수집
  const [result0, ,] = await getCollectWETH(1, 9999)
  const wethEOA = result0;

  // 여기서 EOA 밸류랑, 컨트랙트 밸류가 안맞네 
  // append the collected pool data to the out data
  // L2 Native Token ETH -> add pool data WETH
  for (let i = 0; i < out.data.length; i++) {
    const l2Token = out.data[i].l2Token == ETH ? WETH : out.data[i].l2Token;

    const pool = packPool.find((obj: any) => obj.l2Token === l2Token)
    if (pool === undefined)
      continue;

    // l2 token 자리를 찾은 다음에 packed pool data (유저주소 + 보유량) 뒤에 추가함
    out.data[i].data = out.data[i].data.concat(pool.user) // 올바르게 데이터가 뒤에 붙기는함

    if (l2Token === WETH)
      out.data[i].data = out.data[i].data.concat(wethEOA)
  } // 맞음 여기까지가 Packed pool + WETH 파싱 작업임


  contractAllInToken = await getContractAll2(1, 10000, true)
  // CA Token Collecting
  contractAllInToken.forEach((Info: any) => {
    Info.tokens.forEach((token: any) => {
      if(token != undefined) { // 12업, undefined 처리 해줘야함
        if (token.type === 'ERC-20') {
          for(let i = 0; i < out.data.length; i++){
          
            if(out.data[i].l2Token.toLowerCase() == token.contractAddress.toLocaleLowerCase()) {
              
              out.data[i].data.push({
                claimer: caOwners.get(ethers.utils.getAddress(Info.caAddress.toLowerCase()))!, 
                amount: token.balance,
                type: 2
              })
            }
          }
        }
      }
    })
  })


  // CA ETH Collecting 
  

  // finals deduplicates 
  for (let i = 0; i < out.data.length; i++) {
    const data = out.data[i].data.reduce((acc: any, cur: any) => {
      const isFound = acc.find((item: any, index: any, array: any) => {
        if (item.claimer === cur.claimer) {
          acc[index].amount = BigNumber.from(acc[index].amount).add(BigNumber.from(cur.amount)).toString()
          return true;
        }
      });

      if (!isFound) { // new data 
        acc.push(cur)
      }
      return acc;
    }, [])
    out.data[i].data = data;
  }


  // ca parsing
  const removedETH = BigNumber.from(await L2PROVIDER.getBalance(WETH))
  // CheckPoint: Finally, compare the totals 
  console.log(white.bgGreen.bold("\n Finally, Compare the Total Amounts"))
  for (const info of out.data) {
    // 수집된 에셋 총합 계산
    const l2total: any = info.data.reduce((acc: any, cur: any) => {
      return BigNumber.from(acc).add(BigNumber.from(cur.amount))
    }, 0)

    if (verifyL2Balance.get(info.l2Token) == BigNumber.from(l2total).toString()) {
      console.log(info.tokenName, ' L2 Total Balance: ', verifyL2Balance.get(info.l2Token).toString(), ' Collected L2 Total Balance: ', BigNumber.from(l2total).toString(), green('MATCH ✅'))
    }
    else {
      console.log(info.tokenName, ' L2 Total Balance: ', verifyL2Balance.get(info.l2Token).toString(), ' Collected L2 Total Balance: ', BigNumber.from(l2total).toString(), red('MISMATCH ❌'))
    }
  }

  fs.writeFileSync(path.join(dirPath, 'generate-assets2.json'), JSON.stringify(out, null, 1), 'utf-8')
  await convertToContractData()
}

const convertToContractData = async () => {
  let jsonData = fs.readFileSync(path.join(dirPath, 'generate-assets2.json'), "utf-8")
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
  fs.writeFile(path.join(dirPath, 'generate-assets3.json'), JSON.stringify(outContract, null, 1), 'utf-8', (err) => {
    if (err) {
      console.log(err);
    }
  })
}

main().catch((error) => {
  console.log(error)
  process.exit(1);
})


