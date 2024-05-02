// import fs from 'fs'

// import { ethers } from 'hardhat'; 
// import { BigNumber } from 'ethers';
// import { Client, cacheExchange, fetchExchange } from '@urql/core';
// import { JsonRpcProvider } from '@ethersproject/providers';
// import * as dotenv from 'dotenv'
// // import helpers from "@nomicfoundation/hardhat-toolbox/network-helpers"; 
// // import JSBI from 'jsbi';


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

// const main = async () => {  
//   // command args  need
//   out = {
//     L1startBlock : 0,
//     L1endBlock : 'latest',
//     L2startBlock : 0,
//     L2endBlock : 'latest',
//     data : []
//   }
//   // L2 RPC URL 
//   const provider = new ethers.providers.JsonRpcProvider("https://rpc.titan.tokamak.network");
//   // L1 RPC URL
//   const l1Provider = new ethers.providers.JsonRpcProvider("https://rpc.tokamak.network");
//   let L1TokenContracts:any = [];
//   const L2TokenContracts:any = []; 

//   const l2Bridge = "0x4200000000000000000000000000000000000010";
//   const l1Bridge = "0x59aa194798Ba87D26Ba6bEF80B85ec465F4bbcfD"
//   const l2BridgeContracts = await ethers.getContractAt(L2Interface, l2Bridge)//new ethers.Contract(l2Bridge, L2Interface, provider);
//   const l1BridgeContracts = new ethers.Contract(l1Bridge, L1Interface , l1Provider);

//   //  const filter = {
//   //      address: l2Bridge,
//   //      fromBlock: 0, // startBlock
//   //      toBlock: "latest", // lastBlock
//   //  };

//    // 이벤트 가져오기
//   let eventName = l2BridgeContracts.filters.DepositFinalized();

//   const events = await l2BridgeContracts.queryFilter(eventName, 0, 'latest');
//   if(events.length === 0 || events === undefined) {
//     console.log('No events');
//     process.exit(1);
//   }
    
  
//   // const uniqueAddresses: string[] = Array.from(new Set(addresses));
//   // event.args == undefined 0x000 : topic index2 
//   for (const event of events) {
//     if(event.args !== undefined) {
//       L2TokenContracts.push(
//         {
//           l1 : event.args[0],
//           l2 : event.args[1],
//         }
//       )
//       L1TokenContracts.push(event.args[0])
//     }
//   }
//   L1TokenContracts = Array.from(new Set(L1TokenContracts))

//   const tokenMapper = L2TokenContracts
//     .reduce((map, pair) => {
//       const key = pair.l1;
//       if (!map.has(key)) {
//         map.set(key, pair.l2);
//       }
//       return map;
//     }, new Map<any, any>())
    

//   // token 컨트랙트 표준 준수하는것만 할까 생각이들기도 함
//   //console.log(tokenMapper);
//   // L1 deposit, L2 totalSupply() check

//   // L1, L2 밸런스가 안맞을수있음 --> 주소가
//   // 애초에 브릿지에 토큰 물량을 합쳐서 입금 출금하는게 말이되나 싶기도하고;; 
//   console.log(tokenMapper)
//   for(const contract of L1TokenContracts) {
//     // L1 deposit
//     let v:BigNumber
//     if(contract === ethers.constants.AddressZero) { // ETH  
//       v = await l1Provider.getBalance(l1BridgeContracts.address)      
//       console.log("ETH : ", v)
//     }else  // other ERC20 
//       v = await l1BridgeContracts.deposits(contract, tokenMapper.get(contract))
  
//     // L2 totalSupply()
//     const l2Token = new ethers.Contract(tokenMapper.get(contract), ERC20 , provider);
//     console.log("L1 : ", v.toString() ," L2 : ", (await l2Token.totalSupply()).toString());
//   }

//   // L2 tarnsfer 이벤트로 to, from 수집 중복 제거 --> L2 각 토큰 보유량 계산해서 저장
//   // "event Transfer(address indexed _from, address indexed _to, uint256 _value)"
//   for(let i = 0 ; i < L1TokenContracts.length ; i++) {
//     let totalAddress:any = [];
//     let totalBalance: BigNumber = ethers.BigNumber.from(0);  
//     const data:User[] = [];
//     const token = new ethers.Contract(tokenMapper.get(L1TokenContracts[i]), ERC20 , provider);
    
  
//     eventName = token.filters.Transfer();
//     const transferEvent = await token.queryFilter(eventName, 0,'latest');
//     for (const event of transferEvent) {
//       if(event.args !== undefined) {
//         totalAddress.push(event.args[0])
//         totalAddress.push(event.args[1])
//       }
//     }
    
//     totalAddress = Array.from(new Set(totalAddress))
//     // token balance
//     for(const address of totalAddress) {
//       // console.log((await token.balanceOf(totalAddress[j])).toString(), 'index ', j)

//         const amount = await token.balanceOf(address);
      
//         if(amount.eq(0)) 
//           continue;

//         totalBalance = totalBalance.add(amount) // total balance    
//         if(await provider.getCode(address) === '0x') { // outPool
//           data.push({
//             claimer : address,
//             amount : amount.toString(),
//             type : 0 // 0 : eoa
//           })
//         }else{
//           outPool.push({
//             claimer : address,
//             amount : amount.toString(),
//             type : i // out array index 
//           })
//         }
//     }

//     out.data.push({
//       l1Token: L1TokenContracts[i],
//       l2Token: tokenMapper.get(L1TokenContracts[i]),
//       tokenName: await token.name(),
//       data
//     })

//     console.log("L1 address : ", L1TokenContracts[i]  ," L2 : ", totalBalance.toString());
//     console.log(tokenMapper.get(L1TokenContracts[i]))
//   }  

//   // total Balance 
//   // console.log(out)

//   await main2()
// }

// // mapping(bytes32 => Position.Info) public override positions;
// // ton token
// // "l1Token": "0x2be5e8c109e2197D077D13A82dAead6a9b3433C5",
// // "l2Token": "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2",
// // "tokenName": "Tokamak Network",
// // "claimer": "0xcCD11Ebe55c84f0b793A291b209f80AA15a1CFfC", tos/ton pair address
// // "amount": "46709463561169165244", // 12853766424650193754 --> pool token amount 47,594,532,987,819,499,692
// // "estimate" 47491464624516050000,     12858673943932002000 ? 
// // "type": 1

// // unisawapv3 pool account balance
// // 1. 해당 주소가 컨트랙트인지 판단 해야함 --> 클리어
// // 2. 컨트랙트라면 유니스왑 풀주소인지 확인 --> 결과적으로 어마운트가 0이 아니기 떄문에 누군가는 mint 했다는것이기에 Mint 이벤트 추적하면됨 
// // 3. 유니스왑 풀이면 mint한 주소 + burn 은 어떻게 추적해야할까나? 일단 구해봐야함
// const main2 = async () => {    
//   // test data
//   outPool.push({
//     claimer: '0x1c0ce9aaa0c12f53df3b4d8d77b82d6ad343b4e4', // ton / wton  
//     amount: '1',
//     type: 1
//   })
//   // outPool.push({
//   //   claimer: '0xc29271e3a68a7647fd1399298ef18feca3879f59', // eth / wton
//   //   amount: '1',
//   //   type: 1
//   // })
//   // outPool.push({
//   //   claimer: '0x2ad99c938471770da0cd60e08eaf29ebff67a92a', // tos / eth
//   //   amount: '1',
//   //   type: 1
//   // })

  
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
//     let positions:any = [];
//     // console.log('max index ', maxIndex)
//     // console.log(token0Address)
    

//     let totalA = ethers.BigNumber.from(0);
//     let totalB = ethers.BigNumber.from(0);
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

//     let pTotal:BigNumber = ethers.BigNumber.from(0); // orgin : 12,237,566,208,165,776,476,458,831,790  
//                                                      // test  : 65,872,431,698,535,337,415,424,003,372
//     // const atotal = '256815378173939656494904' // decimals 18 
//     // const btotal = '435883069231040360330179258246796' // decimals 27 
//     // console.log(ethers.utils.formatUnits(atotal, 18))  // 256,818.91.. 256815.378173939656494904
//     // console.log(ethers.utils.formatUnits(btotal, 27))  // 435.883.268.. 435883.069231040360330179258246796

//     for(const p of positions) 
//     {

//       console.log('position index : ', p.id)
//       position.push(p)
//       const _owner = await nonFungibleContract.ownerOf(p.id)
      
//       tokenids.push({
//         tokenId : p.id, 
//         owner : _owner
//       })

//       // send ether 
//       const deployer = await ethers.getSigners();
  
//       await deployer[0].sendTransaction({ // if not enough gas , deployer한테 사전에 가스비를 몰아주는 방법도 있음
//         to: _owner,
//         value: decreaseLiqGas + collectGas 
//       })

//       // set sender
//       await helpers.impersonateAccount(_owner); 
//       const signers:any = await ethers.getSigner(_owner)

//       const tx1 = await nonFungibleContract.connect(signers).callStatic.decreaseLiquidity({
//         tokenId: p.id,
//         liquidity: p.liquidity.toString(),
//         amount0Min: 0,
//         amount1Min: 0,
//         deadline: DEAD_MAX,
//       },{ gasPrice: gasPrice })

      
//         // for(const event of tx.events) {
//         //   if(event.event === "DecreaseLiquidity") {
//         //     const eventData = event.args
//         //     // console.log('decrease: ',eventData.amount0, ' || ', eventData.amount1)  
//         //   }
//         // } 
        
//         // size over.. 
//         const tx2 = await nonFungibleContract.connect(signers).callStatic.collect({
//             tokenId: p.id,
//             recipient: _owner,
//             amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
//             amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
//         },{ gasPrice: gasPrice });
//         // console.log('collect: ',tx.amount0, ' || ', tx.amount1)

//         const amount0 = ethers.BigNumber.from(0).add(tx1.amount0).add(tx2.amount0)
//         const amount1 = ethers.BigNumber.from(0).add(tx1.amount1).add(tx2.amount1)
//         console.log(p.id,' amount0 : ', ethers.utils.formatUnits(amount0.toString(), 18))
//         console.log(p.id,' amount1 : ', ethers.utils.formatUnits(amount1.toString(), 27))
        
//         totalA = totalA.add(amount0)
//         totalB = totalB.add(amount1)
        
//         // set data 
//         Number(amount0) > 0 ? outToken0.push({
//           claimer : _owner,
//           amount : amount0.toString()
//         }) : ""
//         Number(amount1) > 0 ? outToken1.push({
//           claimer : _owner,
//           amount : amount1.toString()
//         }) : ""
//     }
//     console.log('TOS : ', ethers.utils.formatUnits(totalA.toString(), 18))
//     console.log('WTON : ', ethers.utils.formatUnits(totalB.toString(), 27))

//       // const _outToken0 = _outPool.get(token0Address);
//       // const _outToken1 = _outPool.get(token1Address);
//       // outToken0.length > 0 ? _outPool.set(token0Address, _outToken0? _outToken0?.concat(outToken0) : outToken0 ) : ""
//       // outToken1.length > 0 ? _outPool.set(token1Address, _outToken1? _outToken1?.concat(outToken1) : outToken1 ) : ""
 
//       // checker.set(p.claimer,true)
//   }
  
//     // console.log(_outPool.get(token0Address))
//     // console.log(_outPool.get(token1Address))
    
//     // console.log(totalA)
//     // console.log(totalB)
// }




// main2().catch((error) => {
//   console.log(error)
//   process.exit(1);
// })
