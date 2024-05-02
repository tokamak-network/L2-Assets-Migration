import fs from 'fs'
import path from 'path'
import { BigNumberish } from 'ethers';
import * as dotenv from 'dotenv';
import { NonfungibleTokenPositionManager, L2Interface, ERC20, L1Interface, Pool, Closed, User } from './types';
import { ethers } from 'hardhat';

/* 
// Before collecting a collection, you need to do some preliminary work.
// 1. Forking target : L2 RpcUrl   
// 2. Env set : L1rpc, L2rpc, L1bridgeAddress, L2bridgeAddress
// 3. command Arg : startblock(optinal), endblock 
// * Someone's withdrawal request from L2 was processed 2 weeks later. keyword : 1984000000000000000000
// * L2 weth withdraw support?
*/ 
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
    console.log('Bridge address is not set.');
    process.exit(1);
  }
  if(L2BRIDGE == "" || undefined) {
    console.log('Bridge address is not set.');
    process.exit(1);
  }
  if(process.env.CONTRACT_RPC_URL_L1 == "" || undefined) {
    console.log('L1 RPC URL is not set.');
    process.exit(1);
  }
  if(process.env.CONTRACT_RPC_URL_L2 == "" || undefined) {
    console.log('L2 RPC URL is not set.');
    process.exit(1);
  }
  if(process.env.CONTRACTS_NONFUNGIBLE_ADDRESS == "" || undefined) {
    console.log('L2 NONFUNGIBLE is not set.');
    process.exit(1);
  }
}

let out:Closed; // export assets data
const dirPath = "data"
const outPool:any[] = [];

const main = async () => {  
  runChecker();
  const [STBLOCK, ENBLOCK] = await getBlock();
  let L1TokenContracts:any = [];
  const L2TokenContracts:any = []; 
  const l2BridgeContracts = await ethers.getContractAt(L2Interface, L2BRIDGE);
  const l1BridgeContracts = new ethers.Contract(L1BRIDGE, L1Interface, L1PROVIDER); // await ethers.getContractAt(L1Interface, L1BRIDGE);
  out = {
    L1startBlock : STBLOCK,
    L1endBlock : await L1PROVIDER.getBlockNumber(),
    L2startBlock : STBLOCK,
    L2endBlock : ENBLOCK,
    data : []
  }  


  // get deposited evnets 
  let eventName = l2BridgeContracts.filters.DepositFinalized();

  const events:any = await l2BridgeContracts.queryFilter(eventName, STBLOCK, ENBLOCK);
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
  
  const tokenMapper = L2TokenContracts.reduce((map:any, pair:any) => {
      const key = pair.l1;
      if (!map.has(key)) {
        map.set(key, pair.l2);
      }
      return map;
  }, new Map<any, any>())
  console.log("Maaping List : ", tokenMapper)

  for(const contract of L1TokenContracts) {
    // L1 deposit
    let v:BigNumberish
    if(contract === ethers.ZeroAddress) { // ETH  
      v = await L1PROVIDER.getBalance(L1BRIDGE)      
      console.log("ETH : ", v)
    }else  // other ERC20 
      v = await l1BridgeContracts.deposits(contract, tokenMapper.get(contract))
  
    // L2 totalSupply()
    const l2Token = new ethers.Contract(tokenMapper.get(contract), ERC20, L2PROVIDER);
    console.log("L1 : ", v.toString() ," L2 : ", await l2Token.totalSupply());
  }

  // L2 Transfer event collect : "event Transfer(address indexed _from, address indexed _to, uint256 _value)"
  for(let i = 0 ; i < L1TokenContracts.length ; i++) {
    let totalAddress:any = [];
    let totalBalance = ethers.getBigInt(0);
    const data:User[] = [];
    const l2Token = new ethers.Contract(tokenMapper.get(L1TokenContracts[i]), ERC20 , L2PROVIDER);

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
      // console.log((await token.balanceOf(totalAddress[j])).toString(), 'index ', j)
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
            type : i // out array index 
          })
        }
    }
    
    out.data.push({
      l1Token: L1TokenContracts[i],
      l2Token: tokenMapper.get(L1TokenContracts[i]),
      tokenName: await l2Token.name(),
      data
    })

    console.log("L1 address : ", L1TokenContracts[i]  ," L2 : ", totalBalance.toString());
    console.log(tokenMapper.get(L1TokenContracts[i]))
    break;
  }
  
  fs.mkdir(dirPath, { recursive: true }, (err) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    fs.writeFile(path.join(dirPath, 'generate-assets.json'), JSON.stringify(out, null, 1) , 'utf-8', (err)=>{
      if(err) {
          console.log(err);
      }
      process.exit();
    })  
  })
  await collectPool();
}

// v3 pool collect
const collectPool = async() => {
  // test Data 
  // outPool.push({
  //   claimer: '0x707cea1b9f775908429175707dafd9f51696e4ca', 
  //   amount: '3339041901685270549038',
  //   type: 1
  // })
  // outPool.push({
  //   claimer: '0x887cbdec785589c432a198cfb9f96e7600a41c3f', 
  //   amount: '3339041901685270549038',
  //   type: 1
  // })
  // outPool.push({
  //   claimer: '0xac15355e0fc21bc9718d0d1fb6f0f65f45462811', 
  //   amount: '3339041901685270549038',
  //   type: 1
  // })
  // outPool.push({
  //   claimer: '0xae7e78b10c06b975625f8f619ee49641353ca2b5', 
  //   amount: '3339041901685270549038',
  //   type: 1
  // })
  // outPool.push({
  //   claimer: '0xccd11ebe55c84f0b793a291b209f80aa15a1cffc', 
  //   amount: '3339041901685270549038',
  //   type: 1
  // })
  // outPool.push({
  //   claimer: '0xd77bb78091c34aa82cde06b07ed90804cc6db75d', 
  //   amount: '3339041901685270549038',
  //   type: 1
  // })
  // outPool.push({
  //   claimer: '0xf2da60eb3b9b25448874f96d0f337d1148403105', 
  //   amount: '3339041901685270549038',
  //   type: 1
  // })


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

  for(const p of outPool) 
  {
    if(checker.get(p.claimer) === true)
      continue;

    const data:User[] = []; 
    const position:any = [];
    const poolContract = new ethers.Contract(p.claimer, Pool, L2PROVIDER); 

    // todo : Requires non-V3 full contract handling.
    try{ 
      await poolContract.liquidity();
    }catch(err) { continue; }

    let maxIndex = await nonFungibleContract.totalSupply();
    const token0Address = await poolContract.token0();
    const token1Address = await poolContract.token1();
    const token0Contract = new ethers.Contract(token0Address, ERC20, L2PROVIDER); 
    const token1Contract = new ethers.Contract(token1Address, ERC20, L2PROVIDER); 
    
    let tokenids:any = []; // token ids
    const outToken0:any = [];
    const outToken1:any = [];
    const slot0 = await poolContract.slot0(); 
    const poolFee = await poolContract.fee()
    
    let total0 = ethers.getBigInt(0); 
    let total1 = ethers.getBigInt(0);

    // Check all NFT positions, script delay points 
    // todo : Searched positions should be managed as a 'Map' to avoid duplicates 
    for(let i = 1; i <= maxIndex; i++) {
      const _position = await nonFungibleContract.positions(i)

      // check pool
      if( _position.liquidity != 0x00 && _position.token0 == token0Address && _position.token1 == token1Address && poolFee == _position.fee) { 
        const _owner = await nonFungibleContract.ownerOf(i)
        console.log(_owner)

        tokenids.push({
          tokenId : i, 
          owner : _owner
        })
  
        const tx1 = await nonFungibleContract.decreaseLiquidity.staticCallResult({
          tokenId: i,
          liquidity: _position.liquidity,
          amount0Min: 0,
          amount1Min: 0,
          deadline: DEAD_MAX,
        })
        
        const tx2 = await nonFungibleContract.collect.staticCallResult({
            tokenId: i,
            recipient: _owner,
            amount0Max: 2n ** 128n - 1n,
            amount1Max: 2n ** 128n - 1n,
        });
        
        const amount0:bigint = tx1.amount0 + tx2.amount0;
        const amount1:bigint = tx1.amount1 + tx2.amount1;
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
    console.log(await token0Contract.symbol(),'/',await token1Contract.symbol() ,' pool Address -->  ', p.claimer)
    console.log('Pool Amount token0 : ', ethers.formatUnits(await (await token0Contract.balanceOf(p.claimer)), await token0Contract.decimals()))
    console.log('Withdraw Total token0 : ', ethers.formatUnits(total0.toString(), await token0Contract.decimals()))
    console.log('Pool Amount token1 : ', ethers.formatUnits(await token1Contract.balanceOf(p.claimer), await token1Contract.decimals()))
    console.log('Withdraw Total token1 : ', ethers.formatUnits(total1.toString(), await token1Contract.decimals()))
    console.log('----------------------')

    const _outToken0 = _outPool.get(token0Address);
    const _outToken1 = _outPool.get(token1Address);
    outToken0.length > 0 ? _outPool.set(token0Address, _outToken0? _outToken0?.concat(outToken0) : outToken0 ) : ""
    outToken1.length > 0 ? _outPool.set(token1Address, _outToken1? _outToken1?.concat(outToken1) : outToken1 ) : ""

    console.log(_outPool.get(token0Address))
    console.log(_outPool.get(token1Address))
    checker.set(p.claimer,true)
  }


}



collectPool().catch((error) => {
  console.log(error)
  process.exit(1);
})
