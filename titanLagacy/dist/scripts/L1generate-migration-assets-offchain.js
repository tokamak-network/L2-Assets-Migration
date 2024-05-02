"use strict";
// import { ethers } from 'hardhat'; 
// import { BigNumber } from 'ethers';
// import { Client, cacheExchange, fetchExchange } from '@urql/core';
// import { JsonRpcProvider } from '@ethersproject/providers';
// import JSBI from 'jsbi';
// import * as dotenv from 'dotenv'
// const THEGRAPH_API_KEY = process.env.THEGRAPH_API_KEY;
// const Qlendpoint = `https://gateway-arbitrum.network.thegraph.com/api/${THEGRAPH_API_KEY}/deployments/id/QmZeCuoZeadgHkGwLwMeguyqUKz1WPWQYKcKyMCeQqGhsF`;
// const Qlclient = new Client({
//   url: Qlendpoint,
//   exchanges: [cacheExchange, fetchExchange],
// });
// // titan events 
// const L2Interface = [
//   "event DepositFinalized(address indexed _l1Token, address indexed _l2Token, address indexed _from, address _to, uint256 _amount, bytes _data)",
//   "event Mint(address indexed _account, uint256 _amount)",
//   "event Burn(address indexed _account, uint256 _amount)",
//   // "event WithdrawalInitiated( address indexed _l1Token, address indexed _l2Token, address indexed _from, address _to, uint256 _amount, bytes _data )"
// ];
// const ERC20 = [
//   "function balanceOf(address account) external view returns (uint256)",
//   "function totalSupply() external view returns (uint256)",
//   "event Transfer(address indexed _from, address indexed _to, uint256 _value)",
//   "function name() public view returns (string)",
//   "function symbol() public view returns (string)"
// ]
// const L1Interface =[
//   "function deposits(address _firstKey, address _secondKey) public view returns (uint256)"
// ]
// const positionsABI = [
//   "function positions(uint256 tokenId) external view returns (uint96 nonce,address operator,address token0,address token1,uint24 fee,int24 tickLower,int24 tickUpper,uint128 liquidity,uint256 feeGrowthInside0LastX128,uint256 feeGrowthInside1LastX128,uint128 tokensOwed0,uint128 tokensOwed1)"
// ]
// // v3 pool 
// const NonfungibleTokenPositionManager = [
//   "event IncreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
//   "event DecreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
//   "event Collect(uint256 indexed tokenId, address recipient, uint256 amount0, uint256 amount1)",
//   "function positions(uint256 tokenId) external view returns (uint96 nonce,address operator,address token0,address token1,uint24 fee,int24 tickLower,int24 tickUpper,uint128 liquidity,uint256 feeGrowthInside0LastX128,uint256 feeGrowthInside1LastX128,uint128 tokensOwed0,uint128 tokensOwed1)",
//   "function decreaseLiquidity((uint256 tokenId, uint128 liquidity, uint256 amount0Min, uint256 amount1Min, uint256 deadline)) external returns (uint256 amount0, uint256 amount1)",
//   "function collect((uint256 tokenId, address recipient, uint128 amount0Max, uint128 amount1Max)) external returns (uint256 amount0, uint256 amount1)",
//   "function ownerOf(uint256 tokenId) public view returns (address)",
//   "function multicall(bytes[] data) public returns (bytes[] memory results)",
//   "function totalSupply() external view returns (uint256)",
//   "function tokenURI(uint256 tokenId) external view returns (string)"
// ]
// const Pool = [ 
//   "function liquidity() external view returns (uint128)",
//   "function token0() external view returns (address)",
//   "function token1() external view returns (address)",
//   "function slot0() external view returns (uint160 sqrtPriceX96,int24 tick,uint16 observationIndex,uint16 observationCardinality,uint16 observationCardinalityNext,uint8 feeProtocol,bool unlocked)",
//   "event Mint( address sender, address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount, uint256 amount0, uint256 amount1)",
//   "event Burn( address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount, uint256 amount0, uint256 amount1 )",
//   "function ticks(int24 input) external view returns (uint128 liquidityGross,int128 liquidityNet,uint256 feeGrowthOutside0X128,uint256 feeGrowthOutside1X128,int56 tickCumulativeOutside,uint160 secondsPerLiquidityOutsideX128,uint32 secondsOutside,bool initialized)",
//   "function feeGrowthGlobal0X128() external view returns (uint256)",
//   "function feeGrowthGlobal1X128() external view returns (uint256)",
// ] 
// type Closed = {
//   L1startBlock : any;
//   L1endBlock : any; 
//   L2startBlock : any;
//   L2endBlock : any;
//   data : info[]
// }
// type info = {
//   l1Token : string;
//   l2Token : string;
//   tokenName : string;
//   data : User[];
// }
// type User = {
//   claimer : string;
//   amount : string;
//   type : number; // 0 : eoa, 1 : contract(pool)
// }
// let out:Closed; // export assets data
// const outPool:any[] = []; // export assets data
// const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// const Q96:any = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));
// const MIN_TICK = -887272;
// const MAX_TICK = 887272;
// function getTickAtSqrtRatio(sqrtPriceX96){
//     let tick = Math.floor(Math.log((sqrtPriceX96/Q96)**2)/Math.log(1.0001));
//     return tick;
// }
// async function getTokenAmounts(liquidity,sqrtPriceX96,tickLow,tickHigh,token0Decimal,token1Decimal){
//     let sqrtRatioA:any = Math.sqrt(1.0001**tickLow).toFixed(18);
//     let sqrtRatioB:any = Math.sqrt(1.0001**tickHigh).toFixed(18);
//     let currentTick = getTickAtSqrtRatio(sqrtPriceX96);
//     let sqrtPrice = sqrtPriceX96 / Q96;
//     let amount0wei = 0;
//     let amount1wei = 0;
//     if(currentTick <= tickLow){
//         amount0wei = Math.floor(liquidity*((sqrtRatioB-sqrtRatioA)/(sqrtRatioA*sqrtRatioB)));
//     }
//     if(currentTick > tickHigh){
//         amount1wei = Math.floor(liquidity*(sqrtRatioB-sqrtRatioA));
//     }
//     if(currentTick >= tickLow && currentTick < tickHigh){ 
//         amount0wei = Math.floor(liquidity*((sqrtRatioB-sqrtPrice)/(sqrtPrice*sqrtRatioB)));
//         amount1wei = Math.floor(liquidity*(sqrtPrice-sqrtRatioA));
//     }
//     let amount0Human = (amount0wei/(10**token0Decimal)).toFixed(token0Decimal);
//     let amount1Human = (amount1wei/(10**token1Decimal)).toFixed(token1Decimal);
//     console.log("\n\nAmount Token0 wei: "+amount0wei);
//     console.log("Amount Token1 wei: "+amount1wei);
//     // console.log("Amount Token0 : "+parseFloat(amount0Human));
//     // console.log("Amount Token1 : "+parseFloat(amount1Human));
//     return [amount0wei, amount1wei]
// }
// const main = async () => {    
//   // test data
//   outPool.push({
//     claimer: '0x1c0ce9aaa0c12f53df3b4d8d77b82d6ad343b4e4', // ton / wton 
//     amount: '1',
//     type: 1
//   })
//   if(outPool.length == 0)
//     return;
//   const checker = outPool.reduce((map, pair) => {
//     const key = pair.claimer;
//     if (!map.has(key)) {
//       map.set(key, false);
//     }
//     return map;
//   }, new Map<any, any>())
//   const nonFungibleContract = await ethers.getContractAt(NonfungibleTokenPositionManager, "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"); // env config option
//   const gasPrice = ethers.utils.parseUnits("10", "gwei")
//   const decreaseLiqGas = 4000000000000000  // gas 2645590000000000 
//   const collectGas = 2000000000000000 // gas 1138070000000000
//   const DEAD_MAX = "9999999999";
//   const _outPool = new Map<any, any[]>(); // token address : { claimer : address, amount : string }[]
//   for(const p of outPool) 
//   {
//     if(checker.get(p.claimer) === true)
//       continue;
//     await helpers.reset("https://eth-mainnet.g.alchemy.com/v2/eSO4IzrIidndZ6VKyNtHMsxln4xtxMUL"); // reset forking, dont use callstatic 
//     const data:User[] = []; 
//     const position:any = [];
//     const poolContract = await ethers.getContractAt(Pool, p.claimer);
//     try{ // 풀이 아닌 컨트랙트라면..? 어떻게할건지 
//       await poolContract.liquidity();
//     }catch(err) { continue; }
//     const token0Address = await poolContract.token0();
//     const token1Address = await poolContract.token1();
//     const token0Contract = await ethers.getContractAt(ERC20, token0Address)
//     const token1Contract = await ethers.getContractAt(ERC20, token1Address)
//     let tokenids:any = []; // token ids // 647638
//     const maxIndex = await nonFungibleContract.totalSupply();
//     const outToken0:any = [];
//     const outToken1:any = [];
//     const slot0 = await poolContract.slot0(); 
//     const feeGrowthGlobal0X128 = await poolContract.feeGrowthGlobal0X128();
//     const feeGrowthGlobal1X128 = await poolContract.feeGrowthGlobal1X128();
//     let positions:any = [];
//     const query = `
//     {
//       positions(
//         where: {token1_: {symbol: "WTON"}, token0_: {symbol_contains: "TOS"}, liquidity_gt: "0"}
//       ) {
//         id
//         liquidity
//         token0 {
//           name
//           symbol
//           id
//         }
//         token1 {
//           name
//           symbol
//           id
//         }
//         pool {
//           id
//         }
//       }
//     }`;
//     await Qlclient.query(query, { id: 'test' })
//     .toPromise()
//     .then(result => {
//       // console.log(result); // { data: ... }
//       positions = Array.from(new Set(result.data.positions)) 
//     });
//     let totalA = 0;
//     let totalB = 0;
//     for(const p of positions) 
//     {
//       const _position = await nonFungibleContract.positions(p.id)
//       const results = await getTokenAmounts(_position.liquidity, slot0.sqrtPriceX96, _position.tickLower, _position.tickUpper,18,27)
//       const ticksLower = await poolContract.ticks(_position.tickLower);
//       const ticksUpper = await poolContract.ticks(_position.tickUpper);
//       // feeGrowthOutside0X128, feeGrowthOutside1X128
//       const collectFees = await getFeeGrowthInside({
//         feeGrowthOutside0X128: ticksLower.feeGrowthOutside0X128,
//         feeGrowthOutside1X128: ticksLower.feeGrowthOutside1X128
//       },{
//         feeGrowthOutside0X128: ticksUpper.feeGrowthOutside0X128,
//         feeGrowthOutside1X128: ticksUpper.feeGrowthOutside1X128
//       },_position.tickLower, _position.tickUpper, slot0.tick, feeGrowthGlobal0X128, feeGrowthGlobal1X128);
//       console.log(p.id,' amount0 : ', results[0])
//       console.log(p.id,' amount1 : ', results[1])
//       totalA += results[0] + Number(collectFees[0])
//       totalB += results[1] + Number(collectFees[1])
//     }
//     let amount0Human = (totalA/(10**18)).toFixed(18);
//     let amount1Human = (totalB/(10**27)).toFixed(27);
//     console.log("Amount TOS : "+parseFloat(amount0Human));
//     console.log("Amount WTON : "+parseFloat(amount1Human));
//   }
// }
// // const ZERO = JSBI.BigInt(0);
// const ZERO = 0n
// const Q256 = 2n ** 256n
// function subIn256(x: bigint, y: bigint): bigint {
//   const difference = x - y
//   if (difference < ZERO) {
//     return Q256 + difference
//   }
//   return difference
// }
// interface FeeGrowthOutside {
//   feeGrowthOutside0X128: bigint
//   feeGrowthOutside1X128: bigint
// }
// function getFeeGrowthInside(
//   feeGrowthOutsideLower: FeeGrowthOutside, // pool.ticks(position.tickLower) 
//   feeGrowthOutsideUpper: FeeGrowthOutside, // pool.ticks(position.tickUpper) 
//   tickLower: number, // position.tickLower
//   tickUpper: number, // position.tickUpper
//   tickCurrent: number, // slot0.tick
//   feeGrowthGlobal0X128: bigint, // pool.feeGrowthGlobal0X128()
//   feeGrowthGlobal1X128: bigint // pool.feeGrowthGlobal1X128()
// ) {
//   let feeGrowthBelow0X128: bigint
//   let feeGrowthBelow1X128: bigint
//   if (tickCurrent >= tickLower) {
//     feeGrowthBelow0X128 = feeGrowthOutsideLower.feeGrowthOutside0X128
//     feeGrowthBelow1X128 = feeGrowthOutsideLower.feeGrowthOutside1X128
//   } else {
//     feeGrowthBelow0X128 = subIn256(feeGrowthGlobal0X128, feeGrowthOutsideLower.feeGrowthOutside0X128)
//     feeGrowthBelow1X128 = subIn256(feeGrowthGlobal1X128, feeGrowthOutsideLower.feeGrowthOutside1X128)
//   }
//   let feeGrowthAbove0X128: bigint
//   let feeGrowthAbove1X128: bigint
//   if (tickCurrent < tickUpper) {
//     feeGrowthAbove0X128 = feeGrowthOutsideUpper.feeGrowthOutside0X128
//     feeGrowthAbove1X128 = feeGrowthOutsideUpper.feeGrowthOutside1X128
//   } else {
//     feeGrowthAbove0X128 = subIn256(feeGrowthGlobal0X128, feeGrowthOutsideUpper.feeGrowthOutside0X128)
//     feeGrowthAbove1X128 = subIn256(feeGrowthGlobal1X128, feeGrowthOutsideUpper.feeGrowthOutside1X128)
//   }
//   return [
//     subIn256(subIn256(feeGrowthGlobal0X128, feeGrowthBelow0X128), feeGrowthAbove0X128),
//     subIn256(subIn256(feeGrowthGlobal1X128, feeGrowthBelow1X128), feeGrowthAbove1X128),
//   ]
// }
// main().catch((error) => {
//   console.log(error)
//   process.exit(1);
// })
