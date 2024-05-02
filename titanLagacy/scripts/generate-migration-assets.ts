// import fs from 'fs'

// import { ethers } from 'hardhat';
// import { BigNumber } from 'ethers';

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

// // v3 pool 
// const NonfungibleTokenPositionManager = [
//   "event IncreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
//   "event DecreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
//   "event Collect(uint256 indexed tokenId, address recipient, uint256 amount0, uint256 amount1)",
//   "function positions(uint256 tokenId) external view returns (uint96 nonce,address operator,address token0,address token1,uint24 fee,int24 tickLower,int24 tickUpper,uint128 liquidity,uint256 feeGrowthInside0LastX128,uint256 feeGrowthInside1LastX128,uint128 tokensOwed0,uint128 tokensOwed1)",
//   "function decreaseLiquidity((uint256 tokenId, uint128 liquidity, uint256 amount0Min, uint256 amount1Min, uint256 deadline)) external returns (uint256 amount0, uint256 amount1)",
//   "function collect((uint256 tokenId, address recipient, uint128 amount0Max, uint128 amount1Max)) external returns (uint256 amount0, uint256 amount1)",
//   "function ownerOf(uint256 tokenId) public view returns (address)",
//   "function multicall(bytes[] data) public returns (bytes[] memory results)"
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
//   console.log('start',await ethers.getSigners())
//   const l2BridgeContracts = await ethers.getContractAt(L2Interface, l2Bridge) //new ethers.Contract(l2Bridge, L2Interface, provider);
//   console.log('start2')
//   const l1BridgeContracts = new ethers.Contract(l1Bridge, L1Interface , l1Provider);
//   console.log('start3')
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
//     .reduce((map:any, pair:any) => {
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
//   // outPool.push({
//   //   claimer : "0xcCD11Ebe55c84f0b793A291b209f80AA15a1CFfC",
//   //   amount : "46709463561169165244",
//   //   type : 1 
//   // })
//   // outPool.push({
//   //   claimer : "0xcCD11Ebe55c84f0b793A291b209f80AA15a1CFfC", 
//   //   amount : "12853766424650193754",
//   //   type : 1 
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

//   const nonFungibleContract = await ethers.getContractAt(NonfungibleTokenPositionManager, "0xfAFc55Bcdc6e7a74C21DD51531D14e5DD9f29613"); // env config option
//   const pool = await ethers.getContractAt(Pool, "0xcCD11Ebe55c84f0b793A291b209f80AA15a1CFfC");

//   const deployer = await ethers.getSigners();
//   const gasPrice = ethers.utils.parseUnits("10", "gwei")
//   const decreaseLiqGas = 3000000000000000 // gas 2645590000000000
//   const collectGas = 1200000000000000 // gas 1138070000000000
//   const DEAD_MAX = "9999999999";
//   const _outPool = new Map<any, any[]>(); // token address : { claimer : address, amount : string }[]
  
//   for(const p of outPool) {
//     if(checker.get(p.claimer) === true)
//       continue;
  
//     await helpers.reset("https://rpc.titan.tokamak.network"); // reset forking, dont use callstatic 
//     const data:User[] = []; 
//     const position:any = [];
//     const poolContract = await ethers.getContractAt(Pool, "0xcCD11Ebe55c84f0b793A291b209f80AA15a1CFfC");

//     try{ // 풀이 아닌 컨트랙트라면..? 어떻게할건지 
//       await poolContract.liquidity();
//     }catch(err) { continue; }

//     const eventIncreaseLiquidity = nonFungibleContract.filters.IncreaseLiquidity();
//     const increaseLiquidityEvents = await nonFungibleContract.queryFilter(eventIncreaseLiquidity, 0, 'latest');

//     let maxIndex = 1;
//     for(const _increaseLiquidity of increaseLiquidityEvents) {
//       Number(_increaseLiquidity.args!.tokenId.toString()) > maxIndex ? maxIndex = Number(_increaseLiquidity.args!.tokenId.toString()) : maxIndex;
//     }

//     const token0Address = await poolContract.token0();
//     const token1Address = await poolContract.token1();

//     const token0Contract = await ethers.getContractAt(ERC20, token0Address)
//     const token1Contract = await ethers.getContractAt(ERC20, token1Address)
    

//     let tokenids:any = []; // token ids
//     const outToken0:any = [];
//     const outToken1:any = [];

//     for(let i = 1; i < maxIndex; i++) {
//       const _position = await nonFungibleContract.positions(i)
//       if( _position.liquidity != 0x00 && _position.token0 == token0Address && _position.token1 == token1Address) { // target pool
//         position.push(_position)
//         const _owner = await nonFungibleContract.ownerOf(i)

//         tokenids.push({
//           tokenId : i, 
//           owner : _owner
//         })

//         // send ether 
//         await deployer[0].sendTransaction({ // if not enough gas , deployer한테 사전에 가스비를 몰아주는 방법도 있음
//           to: _owner,
//           value: decreaseLiqGas + collectGas 
//         })
        
//         // set sender
//         await helpers.impersonateAccount(_owner); 
//         const signers = await ethers.getSigner(_owner)
  
//         const tx1 = await nonFungibleContract.connect(signers).callStatic.decreaseLiquidity({
//           tokenId: i,
//           liquidity: _position.liquidity.toString(),
//           amount0Min: 0,
//           amount1Min: 0,
//           deadline: DEAD_MAX,
//         },{ gasPrice: gasPrice })

//         // for(const event of tx.events) {
//         //   if(event.event === "DecreaseLiquidity") {
//         //     const eventData = event.args
//         //     // console.log('decrease: ',eventData.amount0, ' || ', eventData.amount1)  
//         //   }
//         // } 
        
//         // size over.. 
//         const tx2 = await nonFungibleContract.connect(signers).callStatic.collect({
//             tokenId: i,
//             recipient: _owner,
//             amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
//             amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
//         },{ gasPrice: gasPrice });
//         // console.log('collect: ',tx.amount0, ' || ', tx.amount1)

//         const amount0 = ethers.BigNumber.from(0).add(tx1.amount0).add(tx2.amount0)
//         const amount1 = ethers.BigNumber.from(0).add(tx1.amount1).add(tx2.amount1)
        
//         // set data 
//         Number(amount0) > 0 ? outToken0.push({
//           claimer : _owner,
//           amount : amount0.toString()
//         }) : ""
//         Number(amount1) > 0 ? outToken1.push({
//           claimer : _owner,
//           amount : amount1.toString()
//         }) : ""
//       }
//     }
//     const _outToken0 = _outPool.get(token0Address);
//     const _outToken1 = _outPool.get(token1Address);
//     outToken0.length > 0 ? _outPool.set(token0Address, _outToken0? _outToken0?.concat(outToken0) : outToken0 ) : ""
//     outToken1.length > 0 ? _outPool.set(token1Address, _outToken1? _outToken1?.concat(outToken1) : outToken1 ) : ""

//     // console.log(_outPool.get(token0Address))
//     // console.log(_outPool.get(token1Address))
//     checker.set(p.claimer,true)
  
//   }
//   // outPool claimer pool address == contract address 
//   for(const p of outPool) {
//     if(checker.get(p.claimer) === false)
//       continue;

//     const data = _outPool.get(out.data[p.type].l2Token)
//     if(data !== undefined) {
//       out.data[p.type].data = out.data[p.type].data.concat(data) 
//     }
    
//     checker.set(p.claimer, false)
//   }

//   // export file
//   fs.writeFile('./generate-assets.json', JSON.stringify(out, null, 1) , 'utf-8', (err)=>{
//       if(err) {
//           console.log(err);
//       }
//       process.exit();
//   })

//   // const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");
//   // let l2provider = new ethers.providers.JsonRpcProvider("https://rpc.titan.tokamak.network");

//   // let poolContract = new ethers.Contract("0xcCD11Ebe55c84f0b793A291b209f80AA15a1CFfC", pool, l2provider);
//   // let nonFungibleContract = new ethers.Contract("0xfAFc55Bcdc6e7a74C21DD51531D14e5DD9f29613", NonfungibleTokenPositionManager, l2provider);
  
//   // const eventMint = poolContract.filters.Mint();
//   // const eventBurn = poolContract.filters.Burn();
//   // const eventIncreaseLiquidity = nonFungibleContract.filters.IncreaseLiquidity();

//   // const mintEvents = await poolContract.queryFilter(eventMint, 0, 'latest');
//   // const burnEvents = await poolContract.queryFilter(eventBurn, 0, 'latest');
//   // const increaseLiquidityEvents = await nonFungibleContract.queryFilter(eventIncreaseLiquidity, 0, 'latest');
  

//   // const mint:any = [];
//   // const burn:any = [];
//   // let totalBalance: BigNumber = ethers.BigNumber.from(0);  
//   // for(const _mint of mintEvents) {
//   //   mint.push(_mint.args)
//   //   totalBalance = totalBalance.add(_mint.args!.amount1)
//   // }
//   // for(const _burn of burnEvents) {
//   //   burn.push(_burn.args)
//   // }


//   // // pool amount0(ton) : 46709463561169165244 // 47727438928658591934
//   // // pool amount1(tos) : 12853766424650193754
//   // //console.log(mint)
//   // console.log(totalBalance.toString())
//   // console.log('----------------------')

//   // // pool pair token address 
//   // const token0 = await poolContract.token0();
//   // const token1 = await poolContract.token1();
//   // const slot0 = await poolContract.slot0(); // slot0.sqrtPriceX96
//   // let totalLiqudity = BigInt("101374235689823072236"); // 101355919964478633918183
//   // console.log(slot0)

//   // const l2ton = new ethers.Contract(token0, ERC20 , l2provider);
//   // const l2tos = new ethers.Contract(token1, ERC20 , l2provider);
//   // // console.log(token0)
//   // // console.log(token1)
//   // // // console.log((await l2ton.balanceOf("0xcCD11Ebe55c84f0b793A291b209f80AA15a1CFfC")).toString())
//   // // // console.log((await l2tos.balanceOf("0xcCD11Ebe55c84f0b793A291b209f80AA15a1CFfC")).toString())

  
//   // let maxIndex = 1;
//   // for(const _increaseLiquidity of increaseLiquidityEvents) {
//   //   Number(_increaseLiquidity.args!.tokenId.toString()) > maxIndex ? maxIndex = Number(_increaseLiquidity.args!.tokenId.toString()) : maxIndex;
//   // }

//   // const position:any = [];
//   // for(let i = 1; i < maxIndex; i++) {
//   //   const _position = await nonFungibleContract.positions(i)

//   //   if( _position.liquidity != 0x00 && _position.token0 == token0 && _position.token1 == token1) { // 제공된 풀이있으면서 ,token0 token1 주소가 일치하는것만 //
//   //     position.push(_position)
//   //     console.log((_position.liquidity).toString())
//   //     // console.log(_position.tickLower,' || ', _position.tickUpper)
//   //   }
//   // }

//   // // // get esiimated pool amounts
//   // // // const value = await estimatePoolAmounts(position[0].liquidity, slot0.sqrtPriceX96, position[0].tickLower, position[0].tickUpper);
//   // // // const value1 = await estimatePoolAmounts(position[1].liquidity, slot0.sqrtPriceX96, position[1].tickLower, position[1].tickUpper);
//   // // // const value2 = await estimatePoolAmounts(position[2].liquidity, slot0.sqrtPriceX96, position[2].tickLower, position[2].tickUpper);
//   // // // console.log(value.value0 ,' || ', value1.value0 ,' || ', value2.value0)
//   // // // console.log(value.value1 + value1.value1 + value2.value1)


//   // // // 47,594,532,987,819,499,692 46557717369782883062 + 18865250547189939 + 1017950367489426691
//   // await helpers.reset("https://rpc.titan.tokamak.network");
//   // nonFungibleContract = await ethers.getContractAt(NonfungibleTokenPositionManager, "0xfAFc55Bcdc6e7a74C21DD51531D14e5DD9f29613");
//   // poolContract = await ethers.getContractAt(pool, "0xcCD11Ebe55c84f0b793A291b209f80AA15a1CFfC");
//   // let eventData:any;
//   // const [deployers] = await ethers.getSigners();
//   // let _prank = await nonFungibleContract.ownerOf(1);
//   // await helpers.impersonateAccount(_prank); // 0x2d45Af0a92a0AC16eD063956d965295a6457461f
//   // let signers = await ethers.getSigner(_prank)

//   // await (await deployers.sendTransaction({
//   //   to: _prank,
//   //   value: ethers.utils.parseEther("1")
//   // })).wait();
  
//   // // console.log('now liq -> ', await poolContract.liquidity())
//   // // gasPrice: BigNumber { value: "1875175000" },
//   // // maxPriorityFeePerGas: BigNumber { value: "1000000000" },
//   // // maxFeePerGas: BigNumber { value: "2750350000" },
//   // // gasLimit: BigNumber { value: "264559" },
//   // let tx = await(await nonFungibleContract.connect(signers).decreaseLiquidity({
//   //   tokenId: 1,
//   //   liquidity: "10102020",//.toString(),
//   //   amount0Min: 0,
//   //   amount1Min: 0,
//   //   deadline: "9999999999",
//   // },{
//   //   gasPrice: gasPrice
//   // })).wait()
//   // console.log('gas used',tx.gasUsed.toString())
//   // // for(const event of tx.events) {
//   // //   if(event.event === "DecreaseLiquidity") {
//   // //     eventData = event.args
//   // //     console.log(eventData.amount0, ' || ', eventData.amount1)
//   // //   }
//   // // } 

//   // // gasPrice: BigNumber { value: "1767435656" },
//   // // maxPriorityFeePerGas: BigNumber { value: "1000000000" },
//   // // maxFeePerGas: BigNumber { value: "2534871312" },
//   // // gasLimit: BigNumber { value: "113807" },
//   // tx = await (await nonFungibleContract.connect(signers).collect({
//   //     tokenId: 1,
//   //     recipient: await nonFungibleContract.ownerOf(1),
//   //     amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
//   //     amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
//   // },{
//   //   gasPrice: gasPrice
//   // })).wait();
//   // console.log('gas used',tx.gasUsed.toString())

//   // console.log(tx.amount0, ' || ', tx.amount1)
//   // console.log('now liq -> ', await poolContract.liquidity())
//   // console.log((await nonFungibleContract.positions(6)).liquidity.toString())
//   // // console.log((eventData.amount0.add(tx.amount0)).toString()); // 총 amount0 (쌓인 수수료 포함) 
//   // // console.log((eventData.amount1.add(tx.amount1)).toString()); // 총 amount1 (쌓인 수수료 포함)


//   // _prank = await nonFungibleContract.ownerOf(6);
//   // await helpers.impersonateAccount(_prank);
//   // signers = await ethers.getSigner(_prank)

//   // await (await deployer.sendTransaction({
//   //   to: _prank,
//   //   value: ethers.utils.parseEther("1")
//   // })).wait();

//   // tx = await (await nonFungibleContract.connect(signers).decreaseLiquidity({
//   //   tokenId: 6,
//   //   liquidity: position[1].liquidity.toString(),
//   //   amount0Min: 0,
//   //   amount1Min: 0,
//   //   deadline: "9999999999",
//   // })).wait();
//   // // for(const event of tx.events) {
//   // //   if(event.event === "DecreaseLiquidity") {
//   // //     eventData = event.args
//   // //     console.log(eventData.amount0, ' || ', eventData.amount1)
//   // //   }
//   // // } 

//   // tx = await nonFungibleContract.connect(signers).callStatic.collect({
//   //     tokenId: 6,
//   //     recipient: await nonFungibleContract.ownerOf(1),
//   //     amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
//   //     amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
//   // });
//   // console.log(tx.amount0, ' || ', tx.amount1)
//   // console.log('now liq -> ', await poolContract.liquidity())
//   // // console.log((results.amount0.add(results2.amount0)).toString()); // 총 amount0 (쌓인 수수료 포함)
//   // // console.log((results.amount1.add(results2.amount1)).toString()); // 총 amount1 (쌓인 수수료 포함)


//   // _prank = await nonFungibleContract.ownerOf(7);
//   // await helpers.impersonateAccount(_prank);
//   // signers = await ethers.getSigner(_prank)

//   // await (await deployer.sendTransaction({
//   //   to: _prank,
//   //   value: ethers.utils.parseEther("1")
//   // })).wait();

//   // tx = await(await nonFungibleContract.connect(signers).decreaseLiquidity({
//   //   tokenId: 7,
//   //   liquidity: position[2].liquidity.toString(),
//   //   amount0Min: 0,
//   //   amount1Min: 0,
//   //   deadline: "9999999999",
//   // })).wait();
//   // // for(const event of tx.events) {
//   // //   if(event.event === "DecreaseLiquidity") {
//   // //     eventData = event.args
//   // //     console.log(eventData.amount0, ' || ', eventData.amount1)
//   // //   }
//   // // } 

//   // tx = await nonFungibleContract.connect(signers).callStatic.collect({
//   //     tokenId: 7,
//   //     recipient: await nonFungibleContract.ownerOf(1),
//   //     amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
//   //     amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
//   // });
//   // console.log(tx.amount0, ' || ', tx.amount1)
//   // console.log('now liq -> ', await poolContract.liquidity())

//   // console.log((await nonFungibleContract.positions(1)).liquidity.toString())
//   // console.log((await nonFungibleContract.positions(6)).liquidity.toString())
//   // console.log((await nonFungibleContract.positions(7)).liquidity.toString())
//   // console.log((results.amount0.add(results2.amount0)).toString()); // 총 amount0 (쌓인 수수료 포함)
//   // console.log((results.amount1.add(results2.amount1)).toString()); // 총 amount1 (쌓인 수수료 포함)
  
 
//   // console.log(burn)
// }


// main().catch((error) => {
//   console.log(error)
//   process.exit(1);
// })