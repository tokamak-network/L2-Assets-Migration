"use strict";
// Multicall - Version 
// const data = {
//   tokenId: 1,
//   liquidity: position[0].liquidity.toString(),
//   amount0Min: 0,
//   amount1Min: 0,
//   deadline: "9999999999",
// }
// const data1 = {
//   tokenId: 6,
//   liquidity: position[1].liquidity.toString(),
//   amount0Min: 0,
//   amount1Min: 0,
//   deadline: "9999999999",
// }
// const data2 = {
//   tokenId: 7,
//   liquidity: position[2].liquidity.toString(),
//   amount0Min: 0,
//   amount1Min: 0,
//   deadline: "9999999999",
// }
// let rdata = {
//     tokenId: 1,
//     recipient: await nonFungibleContract.ownerOf(1),
//     amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
//     amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
// };
// let rdata1 = {
//     tokenId: 6,
//     recipient: await nonFungibleContract.ownerOf(6),
//     amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
//     amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
// };
// let rdata2 = {
//     tokenId: 7,
//     recipient: await nonFungibleContract.ownerOf(7),
//     amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
//     amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
// };
// const abi1 = [
//   "function decreaseLiquidity((uint256 tokenId, uint128 liquidity, uint256 amount0Min, uint256 amount1Min, uint256 deadline)) external returns (uint256 amount0, uint256 amount1)",
// ]
// const abi2 = [
//   "function collect((uint256 tokenId, address recipient, uint128 amount0Max, uint128 amount1Max)) external returns (uint256 amount0, uint256 amount1)",
// ]
// const iface = new ethers.utils.Interface(abi1);
// const iface2 = new ethers.utils.Interface(abi2);
// const encodeData1 = iface.encodeFunctionData('decreaseLiquidity', [data])
// const encodeData2 = iface2.encodeFunctionData('collect', [rdata])
// const encodeData3 = iface.encodeFunctionData('decreaseLiquidity', [data1])
// const encodeData4 = iface2.encodeFunctionData('collect', [rdata1])
// const encodeData5 = iface.encodeFunctionData('decreaseLiquidity', [data2])
// const encodeData6 = iface2.encodeFunctionData('collect', [rdata2])
// const result = await nonFungibleContract.callStatic.multicall([encodeData1, encodeData3, encodeData5])
// const decodeData1 = iface.decodeFunctionResult('decreaseLiquidity', result[0])
// const decodeData2 = iface.decodeFunctionResult('decreaseLiquidity', result[1])
// const decodeData3 = iface.decodeFunctionResult('decreaseLiquidity', result[2])
// const decodeData4 = iface2.decodeFunctionResult('collect', result[3])
// const decodeData5 = iface.decodeFunctionResult('decreaseLiquidity', result[4])
// const decodeData6 = iface2.decodeFunctionResult('collect', result[5])
// console.log(decodeData1[0].toString())
// console.log(decodeData2[0].toString())
// console.log(decodeData3[0].toString())
// console.log((decodeData1[0].add(decodeData2[0])).toString()); // 총 amount0 (쌓인 수수료 포함)
// console.log((decodeData1[1].add(decodeData2[1])).toString()); // 총 amount1 (쌓인 수수료 포함)
// console.log((results.amount0.add(results2.amount0)).toString()); // 총 amount0 (쌓인 수수료 포함)
// console.log((results.amount1.add(results2.amount1)).toString()); // 총 amount1 (쌓인 수수료 포함)
// console.log((results.amount0.add(results2.amount0)).toString()); // 총 amount0 (쌓인 수수료 포함)
// console.log((results.amount1.add(results2.amount1)).toString()); // 총 amount1 (쌓인 수수료 포함)
