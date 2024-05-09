import fs from 'fs'
import path from 'path'
import { BigNumberish } from 'ethers';
import { ethers } from 'hardhat'
import { Client, cacheExchange, fetchExchange } from '@urql/core';
import { NonfungibleTokenPositionManager, L2Interface, ERC20, L1Interface, Pool, Closed, User,Info } from './types';
import { red, green,white,blue } from 'console-log-colors';
import * as dotenv from 'dotenv';

/* 
// Using Subgraph
// Faster than onchain computation.
// Graph queries can vary in form, requiring some modifications to the script URL and query statement.
*/ 
const THEGRAPH_API_KEY = process.env.THEGRAPH_API_KEY || "";
const THEGRAPH_GATEWAY = process.env.THEGRAPH_GATEWAY || "";
const THEGRAPH_V3DOMAIN = process.env.THEGRAPH_V3DOMAIN || "";
// eg URL:`https://gateway-arbitrum.network.thegraph.com/api/${THEGRAPH_API_KEY}/deployments/id/QmZeCuoZeadgHkGwLwMeguyqUKz1WPWQYKcKyMCeQqGhsF`
const Qlendpoint = `${THEGRAPH_GATEWAY}'/'${THEGRAPH_API_KEY}'/'${THEGRAPH_V3DOMAIN}` ;
const Qlclient = new Client({
  url: "https://thegraph.titan.tokamak.network/subgraphs/name/tokamak/titan-uniswap-subgraph", // L2 subgraph URL
  exchanges: [cacheExchange, fetchExchange],
});

const L1PROVIDER = new ethers.JsonRpcProvider(process.env.CONTRACT_RPC_URL_L1 || ""); // L1 RPC URL
const L2PROVIDER = new ethers.JsonRpcProvider(process.env.CONTRACT_RPC_URL_L2 || ""); // L2 RPC URL
const L1BRIDGE = process.env.CONTRACTS_L1BRIDGE_ADDRESS || ""; // L1 bridge address
const L2BRIDGE = process.env.CONTRACTS_L2BRIDGE_ADDRESS || ""; // L2 bridge address
const DEAD_MAX =  Math.floor(Date.now() / 1000) + 1200

const getBlock = async() => {
  const L1_StartBlock = process.env.L1_START_BLOCK || 0;
  const L1_EndBlock = process.env.L1_END_BLOCK || await L1PROVIDER.getBlockNumber();
  const L2_StartBlock = process.env.L2_START_BLOCK || 0;
  const L2_EndBlock = process.env.L2_END_BLOCK || await L2PROVIDER.getBlockNumber();
  return [L1_StartBlock, L1_EndBlock, L2_StartBlock, L2_EndBlock];
}

const runChecker = () => {
  if(L1BRIDGE == "" || undefined) {
    console.log(red('env Error : Bridge address is not set. \n'));
    process.exit(1);
  }
  if(L2BRIDGE == "" || undefined) {
    console.log(red('env Error : Bridge address is not set. \n'));
    process.exit(1);
  }
  if(process.env.CONTRACT_RPC_URL_L1 == "" || undefined) {
    console.log(red('env Error : L1 RPC URL is not set. \n'));
    process.exit(1);
  }
  if(process.env.CONTRACT_RPC_URL_L2 == "" || undefined) {
    console.log(red('env Error : L2 RPC URL is not set. \n'));
    process.exit(1);
  }
  if(process.env.CONTRACTS_NONFUNGIBLE_ADDRESS == "" || undefined) {
    console.log(red('env Error : L2 NONFUNGIBLE is not set. \n')); 
    process.exit(1);
  }
  // if(process.env.THEGRAPH_API_KEY == "" || undefined) {
  //   console.log(red('env Error : L2 THEGRAPH_API_KEY is not set. \n')); 
  //   process.exit(1);
  // }
  // if(process.env.THEGRAPH_GATEWAY == "" || undefined) {
  //   console.log(red('env Error : L2 THEGRAPH_GATEWAY is not set. \n')); 
  //   process.exit(1);
  // }
  // if(process.env.THEGRAPH_V3DOMAIN == "" || undefined) {
  //   console.log(red('env Error : L2 THEGRAPH_V3DOMAIN is not set. \n')); 
  //   process.exit(1);
  // }
}

let out:Closed; // export assets data
const dirPath = "data"
const outPool:any[] = [];
const verifyL2Balance = new Map<any, any>(); // L2 token address : totalSupply
let L1TokenContracts:any = []; // L1 tokens contracts address 
let tokenMapper:any // L1 -> L2 token address mapping 

const main = async () => {  
  runChecker();
  const [STBLOCK, ENBLOCK, L2STBLOCK, L2ENDBLOCK] = await getBlock();
  const L2TokenContracts:any = []; 
  const l2BridgeContracts = new ethers.Contract(L2BRIDGE, L2Interface, L2PROVIDER); 
  const l1BridgeContracts = new ethers.Contract(L1BRIDGE, L1Interface, L1PROVIDER); 
  out = {
    L1startBlock : STBLOCK,
    L1endBlock : await L1PROVIDER.getBlockNumber(),
    L2startBlock : STBLOCK,
    L2endBlock : ENBLOCK,
    data : []
  }  

  // get deposited evnets 
  let eventName = l2BridgeContracts.filters.DepositFinalized();

  const events:any = await l2BridgeContracts.queryFilter(eventName, L2STBLOCK, L2ENDBLOCK);
  if(events.length === 0 || events === undefined) {
    console.log('does not exit asset events');
    process.exit(1);
  }
  
  for (const event of events) {
    if(event.args !== undefined) {
      L2TokenContracts.push(
        {
          l1 : event.args[0],
          l2 : event.args[1],
        }
      )
      L1TokenContracts.push(event.args[0])
    }
  }
  L1TokenContracts = Array.from(new Set(L1TokenContracts))
  
  tokenMapper = L2TokenContracts.reduce((map:any, pair:any) => {
      const key = pair.l1;
      if (!map.has(key)) {
        map.set(key, pair.l2);
      }
      return map;
  }, new Map<any, any>())
  console.log(blue.bgGreen.bold.underline("L1 : L2 Assets Address List :"))
  console.log(tokenMapper,'\n')
  

  // 1차 수집 : L2 에서 수집된 자산이 L1이랑 비교해서 일치하는지 여부 (Deposit 된물량:TotoalSupply 비교)
  // todo : Withdraw 물량을 완벽하게 체크하기가 힘듬? Ton은 스테이킹때문에 L1에서 언스테이킹 기간 1주일 더해져서 2주까지 걸리고, 나머지는 최대 1주 
  // 결과적으로 명확한 비교를 할필요가있긴함
  console.log(blue.bgGreen.bold.underline("1st : Check L2 withdrawal volumes"))

  for(const contract of L1TokenContracts) {
    // L1 deposit
    let v:BigNumberish
    if(contract === ethers.ZeroAddress) { // ETH  
      v = await L1PROVIDER.getBalance(L1BRIDGE)      
    }else  // other ERC20 
      v = await l1BridgeContracts.deposits(contract, tokenMapper.get(contract))
  
    // L2 totalSupply()
    const l2Token = new ethers.Contract(tokenMapper.get(contract), ERC20, L2PROVIDER);
    const l2Balance = await l2Token.totalSupply();
    if(v == l2Balance) {
      console.log("L1 : ", v.toString() ," L2 : ", l2Balance.toString(), ' : ', blue('MATCH ✅'))
    }else if (v > l2Balance) {
      console.log("L1 : ", v.toString() ," L2 : ", l2Balance.toString(), ' : ', red('L1 > L2 🟠'))
    }else{
      console.log("L1 : ", v.toString() ," L2 : ", l2Balance.toString(), ' : ', red('ISSUE ❌'))
    }
    verifyL2Balance.set(tokenMapper.get(contract), l2Balance)
  }

  console.log(blue.bgGreen.bold.underline("\n Collect L2 wallets and Check Assets holdings"))
  for(let i = 0 ; i < L1TokenContracts.length ; i++) {
    let totalAddress:any = [];
    let totalBalance = ethers.getBigInt(0);
    const data:User[] = [];
    const l2Token = new ethers.Contract(tokenMapper.get(L1TokenContracts[i]), ERC20 , L2PROVIDER);
    const l2TokenName = await l2Token.name();

    eventName = l2Token.filters.Transfer();
    const transferEvent:any = await l2Token.queryFilter(eventName, 0,'latest');
    for (const event of transferEvent) {
      if(event.args !== undefined) {
        totalAddress.push(event.args[0])
        totalAddress.push(event.args[1])
      }
    }
   
    totalAddress = Array.from(new Set(totalAddress)) // deduplication
    for(const address of totalAddress) {
        const amount = await l2Token.balanceOf(address);
        if(amount === 0) 
          continue;

        totalBalance = totalBalance + amount// total balance  update
        if(await L2PROVIDER.getCode(address) === '0x') { // outPool
          data.push({
            claimer : address,
            amount : amount.toString(),
            type : 0 // 0 : eoa
          })
        }else{
          outPool.push({
            claimer : address,
            amount : amount.toString(),
            type : i,  // outPool array index 
            l2Token : tokenMapper.get(L1TokenContracts[i])
          })
        }
    }
    // 2차 수집 : L2 에서 주소수집시 1차랑 비교했을때 일치하는지 여부
    console.log('⦿ Withdrawal L2 Token Info : ',tokenMapper.get(L1TokenContracts[i]), ' Name: ', l2TokenName)
    if(verifyL2Balance.get(tokenMapper.get(L1TokenContracts[i])) == totalBalance) {
      console.log('Withdrawal L2 Balance    : ', verifyL2Balance.get(tokenMapper.get(L1TokenContracts[i])) , ' Collected L2 Balance: ', totalBalance,blue(' MATCH ✅ \n'))
    }else 
      console.log('Withdrawal L2 Balance: ', verifyL2Balance.get(tokenMapper.get(L1TokenContracts[i])) , ' Collected L2 Balance: ', totalBalance,blue(' MISMATCH ❌ \n'))
    
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
    fs.writeFile(path.join(dirPath, 'generate-assets1.sub.json'), JSON.stringify(out, null, 1) , 'utf-8', (err)=>{
      if(err) {
          console.log(err);
          process.exit(1);
      }
    }) 
    console.log(blue.bgBlue.bold("📝 Generate 'assets1.sub.json' File complete!"))
    console.log("\n\n")
  })

  await collectPool();
}

// v3 pool collect
const collectPool = async() => {
  if(outPool.length == 0){
    console.log('Not exist pool, Complete!')
    return;
  }

  // pool deduplication checker
  const checker = outPool.reduce((map, pair) => {
    const key = pair.claimer;
    if (!map.has(key)) {
      map.set(key, false);
    }
    return map;
  }, new Map<any, any>())


  const nonFungibleContractAddress = process.env.CONTRACTS_NONFUNGIBLE_ADDRESS!;
  const nonFungibleContract = new ethers.Contract(nonFungibleContractAddress, NonfungibleTokenPositionManager, L2PROVIDER);
  const _outPool = new Map<any, any[]>(); // token address : { claimer : address, amount : string }[]
  console.log(white.bgGreen.bold("Collecting Pool Data...."))  
  for(const p of outPool) 
  {
    if(checker.get(p.claimer) === true)
      continue;

    const data:User[] = []; 
    const position:any = [];
    const poolContract = new ethers.Contract(p.claimer, Pool, L2PROVIDER); 

    // todo : Requires non-V3 full contract handling.
    try{ 
      if(await poolContract.liquidity() == 0) 
        continue; 
    }catch(err) { continue; }

  
    const token0Address = await poolContract.token0();
    const token1Address = await poolContract.token1();
    const token0Contract = new ethers.Contract(token0Address, ERC20, L2PROVIDER); 
    const token1Contract = new ethers.Contract(token1Address, ERC20, L2PROVIDER); 
    const token0Name = await token0Contract.symbol()
    const token1Name = await token1Contract.symbol()
    
    const outToken0:any = [];
    const outToken1:any = [];
    // const slot0 = await poolContract.slot0(); 
    const poolFee = await poolContract.fee()
    const totalMap = new Map<any, any>(); // total amount (token address => amount)
    
    let total0 = ethers.getBigInt(0); 
    let total1 = ethers.getBigInt(0);
    // CheckPoint: Check if you can withdraw less than the amount the pool has.
    console.log("💧 Pool Info Address: ",p.claimer, " Pair: ",token0Name,'/',token1Name,'Pool Fee: ',poolFee,'\n')
    let positions:any = [];
    let flag = true;
    let skip = 0;
    while(flag){
      const query = `
      {
        positions(
          where: {pool: "${p.claimer.toLowerCase()}", liquidity_gt: "1"}
          first: 1000
          skip: ${skip}
        ) {
          id
          liquidity
          owner
          token0 {
            name
            symbol
            id
          }
          token1 {
            name
            symbol
            id
          }
          pool {
            id
            feeTier
          }
        }
      }`;
    
      const result = await Qlclient.query(query, { id: 'test' })
      positions = positions.concat(result.data.positions)
      flag = result.data.positions.length == 1000 ? true : false;
      skip += 1000;
    }

    for(let i = 0; i < positions.length; i++) {
      // check pool
      if( positions[i].liquidity != 0x00 && poolFee == positions[i].pool.feeTier) { 
        const _owner = await nonFungibleContract.ownerOf(positions[i].id)
        
        const tx1 = await nonFungibleContract.decreaseLiquidity.staticCallResult({
          tokenId: positions[i].id,
          liquidity: positions[i].liquidity,
          amount0Min: 0,
          amount1Min: 0,
          deadline: DEAD_MAX,
        })
        
        const tx2 = await nonFungibleContract.collect.staticCallResult({
            tokenId: positions[i].id,
            recipient: _owner,
            amount0Max: 2n ** 128n - 1n,
            amount1Max: 2n ** 128n - 1n,
        });
        
        const amount0:bigint = tx1.amount0 + tx2.amount0;
        const amount1:bigint = tx1.amount1 + tx2.amount1;
        totalMap.set(token0Address, totalMap.get(token0Address) ? totalMap.get(token0Address) + amount0 : amount0)
        totalMap.set(token1Address, totalMap.get(token1Address) ? totalMap.get(token0Address) + amount1 : amount1)
        total0 += amount0       
        total1 += amount1
        
        // set data 
        Number(amount0) > 0 ? outToken0.push({
          claimer : _owner,
          amount : amount0.toString()
        }) : ""
        Number(amount1) > 0 ? outToken1.push({
          claimer : _owner,
          amount : amount1.toString()
        }) : ""
      }
    }
    console.log('Pool Amount token0: ', ethers.formatUnits(await (await token0Contract.balanceOf(p.claimer)), await token0Contract.decimals()),' Pool State: ',(await token0Contract.balanceOf(p.claimer)) >= total0 ? green('MATCH ✅') : red('MISMATCH ❌'))
    console.log('Withdraw Available Total Token0: ', ethers.formatUnits(total0.toString(), await token0Contract.decimals()))
    console.log('Pool Amount token1: ', ethers.formatUnits(await (await token1Contract.balanceOf(p.claimer)), await token1Contract.decimals()),' Pool State: ',(await token1Contract.balanceOf(p.claimer)) >= total1 ? green('MATCH ✅') : red('MISMATCH ❌'))
    console.log('Withdraw Available Total Token1: ', ethers.formatUnits(total1.toString(), await token1Contract.decimals()))
    

    const _outToken0 = _outPool.get(token0Address);
    const _outToken1 = _outPool.get(token1Address);
    outToken0.length > 0 ? _outPool.set(token0Address, _outToken0? _outToken0.concat(outToken0) : outToken0 ) : ""
    outToken1.length > 0 ? _outPool.set(token1Address, _outToken1? _outToken1.concat(outToken1) : outToken1 ) : ""
    checker.set(p.claimer,true)
  }
  

  // Sum and pack the collected pool data.
  const packPool:any = []; 
  for(const l1Token of L1TokenContracts) {
    const l2Token = tokenMapper.get(l1Token);
    
    if(_outPool.has(l2Token) === false) 
      continue;

    const l2Pool = _outPool.get(l2Token);
    const sumPool = l2Pool?.reduce((acc:Map<string,string>, {claimer, amount}) => {
      if(acc.has(claimer)){
        const current:any = acc.get(claimer)
        acc.set(claimer, (BigInt(current) + BigInt(amount)).toString())
      }else{
        acc.set(claimer, amount)
      }
      return acc;
    }, new Map<string,string>())

    const entries = Array.from(sumPool!.entries())

    packPool.push({
      l2Token : l2Token,
      user: entries.map(([claimer, amount]) => ({claimer, amount, type: 1})),  
    })
  }


  // append the collected pool data to the out data
  for(let i =0 ; i < out.data.length ;i++) {
    const l2Token = out.data[i].l2Token;

    const pool = packPool.find((obj:any) => obj.l2Token === l2Token)
    if(pool === undefined) 
      continue;
      
      out.data[i].data = out.data[i].data.concat(pool.user) 
  }

  // finals deduplicates 
  for(let i =0 ; i < out.data.length; i++) {
    const data = out.data[i].data.reduce((acc:any, cur:any) => { 
      const isFound = acc.find((item:any,index:any, array:any) => {
        if(item.claimer === cur.claimer){
          acc[index].amount = (BigInt(acc[index].amount) + BigInt(cur.amount)).toString()
          return true;
        }
      }); 
    
      if(!isFound) { // new data 
        acc.push(cur)
      }
      return acc;
    },[])
    out.data[i].data = data;
  }

  // CheckPoint: Finally, compare the totals 
  console.log(white.bgGreen.bold("\n Finally, Compare the Total Amounts")) 
  for(const info of out.data) {
    const l2total = info.data.reduce((acc:any, cur:any) => {
      return BigInt(acc) + BigInt(cur.amount)
    },0)
    if(verifyL2Balance.get(info.l2Token) >= l2total) {
      console.log('L2 Total Balance: ', verifyL2Balance.get(info.l2Token), ' Collected L2 Total Balance: ', l2total, green('MATCH ✅'))
    }
    else {
      console.log('L2 Total Balance: ', verifyL2Balance.get(info.l2Token), ' Collected L2 Total Balance: ', l2total, red('MISMATCH ❌'))
    }
  }

  fs.writeFileSync(path.join(dirPath, 'generate-assets2.sub.json'), JSON.stringify(out, null, 1) , 'utf-8')
  await convertToContractData()
}

// json --> contract registry data
const convertToContractData = async() => {
  let jsonData = fs.readFileSync(path.join(dirPath, 'generate-assets2.sub.json'), "utf-8")
  let assetsData = JSON.parse(jsonData)
  const outContract= [];

  // keccak256(abi.encodePacked(_token, _claimer, _amount));
  for(const data of assetsData.data) {
    const inner = {
      l1Token : data.l1Token,
      l2Token : data.l2Token,
      tokenName : data.tokenName,
      data : new Array()
    }
    for(const userData of data.data) {
      inner.data.push({
        "claimer": userData.claimer,
        "amount": userData.amount,
        "hash" : ethers.solidityPackedKeccak256(['address', 'address', 'uint256'], [data.l1Token, userData.claimer, userData.amount])
      })
    }
    outContract.push(inner)
  }
  fs.writeFile(path.join(dirPath, 'generate-assets3.sub.json'), JSON.stringify(outContract, null, 1) , 'utf-8', (err)=>{
    if(err) {
        console.log(err);
    }
  })  
}

main().catch((error) => {
  console.log(error)
  process.exit(1);
})
