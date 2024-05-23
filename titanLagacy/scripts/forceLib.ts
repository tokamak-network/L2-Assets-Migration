import fs from 'fs'
import path from 'path'
import { ethers as ethers2 } from 'ethers2';
import { ethers } from "ethers";
import { BatchCrossChainMessenger, MessageStatus} from "@tokamak-network/titan-sdk"
import { L2Interface, WithdrawClaimed,Pool, User } from './types';
import { blue } from 'console-log-colors';
import ProgressBar from 'progress';
import axios from 'axios';
import * as dotenv from 'dotenv';

/*
// Provides a function to easily obtain Ethereum balance based on Titan or track withdrawal request volume.
*/

const WETH = process.env.L2_WETH_ADDRESS || ""
const L2PROVIDER = new ethers2.JsonRpcProvider(process.env.CONTRACT_RPC_URL_L2 || ""); // L2 RPC URL
const L2BRIDGE = process.env.CONTRACTS_L2BRIDGE_ADDRESS || ""; // L2 bridge address
const baseUrl = "https://explorer.titan.tokamak.network/api?"
const dirPath = "data"

// true : claimed, false : unclaimed
const isClaimed = (state:MessageStatus|any)=>{
  return  state == MessageStatus.RELAYED ? true : false
}

const addHexPrefix = (privateKey:any) => {
  if (privateKey.substring(0, 2) !== "0x") {
    privateKey = "0x" + privateKey
  }
  return privateKey
}

const replacer = (key:any, value:any) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export interface Account {
  address: string;
  balance: bigint;
  stale: boolean;
}

export interface Response {
  message: string;
  result: any[];
  status: string;
}


/**
 * Retrieves the withdrawal claim status for a list of transaction hashes or WithdrawClaimed objects.
 *
 * @param {string[] | WithdrawClaimed[]} txHashes - An array of transaction hashes or WithdrawClaimed objects.
 * @param {Object} opts - Options for configuring the function.
 * @param {number} opts.l1ChainId - The chain ID for Layer 1.
 * @param {number} opts.l2ChainId - The chain ID for Layer 2.
 * @param {boolean} [opts.bedrock=false] - Optional flag to indicate if Bedrock is enabled.
 * @param {boolean} [opts.save=false] - Optional flag to indicate if the result should be saved to a file.
 * @returns {Promise<any>} - Returns a promise that resolves to an array of objects containing transaction hash, state, and claim status.
 * 
 */
export const getWithdrawalClaimStatus = async (
  txHashes:string[]|WithdrawClaimed[],
  opts:{
    l1ChainId:number,
    l2ChainId:number,
    bedrock?:boolean,
    save?:boolean
  }
): Promise<any> => {
  const l2Provider = new ethers.providers.JsonRpcProvider(process.env.CONTRACT_RPC_URL_L2); 
  const l2wallet = new ethers.Wallet(addHexPrefix(process.env.L1_PORXY_OWNER) || "",l2Provider);
  const l1Provider = new ethers.providers.JsonRpcProvider(process.env.L1_PRC_URL_SDK); 
  const l1wallet = new ethers.Wallet(addHexPrefix(process.env.L1_PORXY_OWNER) || "",l1Provider);

  const crossDomainMessenger = new BatchCrossChainMessenger({
    l1SignerOrProvider: l1wallet,
    l2SignerOrProvider: l2wallet,
    l1ChainId: opts.l1ChainId,   
    l2ChainId: opts.l2ChainId,  
    bedrock: opts.bedrock? true : false
  })
  const result:any = [];

  const total = txHashes.length;
  const bar = new ProgressBar(':bar :current/:total', { width: 50, total: total});
  console.log(blue.bgBlue.bold("🔍 Retrieving withdrawal claim status..."))
  for (const tx of txHashes) {
    if (typeof tx === 'string') {
      const state: MessageStatus = await crossDomainMessenger.getMessageStatus(tx);
      if(!isClaimed(state)){
        result.push({
          txHash: tx,
          state: state,
          isClaimed: isClaimed(state),
        });
      }
    } else if (typeof tx === 'object') {
      const state: MessageStatus = await crossDomainMessenger.getMessageStatus(tx.txHash);
      if(!isClaimed(state)){
        result.push({
          ...tx,
          state: state,
          isClaimed: isClaimed(state),
        });
      }
    }
    bar.tick();
  }

  if(opts.save? true : false) {
    fs.mkdir(dirPath, { recursive: true }, (err) => {
      if (err) {
        console.log(err);
        process.exit(1);
      }
      fs.writeFile(path.join(dirPath, 'generate-WithdrawalClaim.json'), JSON.stringify(result, replacer, 1) , 'utf-8', (err)=>{
        if(err) {
            console.log(err);
            process.exit(1);
        }
      }) 
      console.log(blue.bgBlue.bold("📝 Generate 'generate-WithdrawalClaim.json' File complete!"))
      console.log("\n")
    })
  }

  return result
}

/**
 * Processes the withdrawal claims from a JSON file and aggregates the amount for each l1Token.
 *
 * @returns {Map<any, any>} - A map where the key is the l1Token and the value is the aggregated amount.
 *
 */
export const getWithdrawalIsClaimAll = () => {
  const obj = JSON.parse(fs.readFileSync(path.join(dirPath, 'generate-WithdrawalClaim.json'), 'utf-8'));
  const maps = new Map<any,any>();

  for(const data of obj) {
      maps.has(data.event.l1Token) ? 
        maps.set(data.event.l1Token, ethers2.toBigInt(maps.get(data.event.l1Token)) + ethers2.toBigInt(data.event.amount)) :
         maps.set(data.event.l1Token, data.event.amount)
  }
}

/**
 * @param {integer} page - A nonnegative integer that represents the page number to be used for pagination. 'offset' must be provided in conjunction.
 * @param {integer} offset - A nonnegative integer that represents the maximum number of records to return when paginating. 'page' must be provided in conjunction.
 */
export const getTotalAddressAll = async(page:number, offest:number, flag?:boolean) => {
  const query = `module=account&action=listaccounts&page=${page}&offset=${offest}`;
  let accounts: Account[] = [];
  try {
      const response = await axios.get<Response>(baseUrl + query);
      
      if (response.data.status === '1') {
          accounts = response.data.result;    
          // console.log('Accounts:', accounts);
      } else {
          console.error('Failed to fetch data:', response.data.message);
      }
  } catch (error) {
      console.error('Error fetching data:', error);
  }
  
  
  const result0:User[] = []; // EOA
  const result1:User[] = []; // CA - POOL
  const result2:User[] = []; // CA - NOT POOL
  const result0Str:any = []; // EOA

  let totalBalance = ethers2.getBigInt(0);
  const total = accounts.length;
  const bar = new ProgressBar(':bar :current/:total', { width: 50, total: total});
  console.log(blue.bgBlue.bold("🔍 Retrieving total ETH balance..."))
  for(const account of accounts){
      if(await L2PROVIDER.getCode(account.address) === '0x' && account.balance > 0){
          result0.push({
            claimer: account.address,
            amount: account.balance.toString(),
            type:  0
          })
          if(flag){
            result0Str.push(account.address)
          }
      }else if (account.balance > 0) {
        const poolContract = new ethers2.Contract(account.address, Pool, L2PROVIDER); 
        try{
          await poolContract.liquidity()
          result1.push({
            claimer: account.address,
            amount: account.balance.toString(),
            type:  1
          })
        }catch(err){
          result2.push({
            claimer: account.address,
            amount: account.balance.toString(),
            type: 2
          })
        }
      }
      bar.tick();
      totalBalance = totalBalance + ethers2.getBigInt(account.balance)
  }
  // console.log(result0.length)
  // console.log( result2)
  // console.log(totalBalance)
  return [result0, result1, result2, flag? result0Str : undefined]
}


/**
 * Get all contract addresses deployed on the Titan network. v3 pool addresses are filtered out.
 * 
 * @param {integer} page - A nonnegative integer that represents the page number to be used for pagination. 'offset' must be provided in conjunction.
 * @param {integer} offset - A nonnegative integer that represents the maximum number of records to return when paginating. 'page' must be provided in conjunction.
 * @param {boolean} flag - 'true' contains the list of tokens held by the contract. Default false
 */
export const getContractAll = async(page:number, offest:number, flag?:boolean) => {
  const result:any = [];
  let data:any = [];
  try {
    for(let i = 1 ; i <= page; i++){
      const query = `module=contract&action=listcontracts&page=${i}&offset=${offest}`;
      const response = await axios.get<Response>(baseUrl + query);
      if (response.data.status === '1') {
        if(response.data.result === null || response.data.result === undefined || response.data.result.length === 0)
          break;
        data.push(...response.data.result);
      } else {
        console.error('Failed to fetch data:', response.data.message);
      }  
    }
  } catch (error) {
      console.error('Error fetching data:', error);
  }
  const convertData:any = [];
  await Promise.all(data.map(async(item:any) =>{
    const poolContract = new ethers2.Contract(item.Address, Pool, L2PROVIDER); 
      // todo : Requires non-V3 full contract handling.
        try{
          await poolContract.liquidity()
        }catch(err){
          convertData.push(item.Address)
        }
  }));

  if (flag){
    const total = convertData.length;
    const bar = new ProgressBar(':bar :current/:total', { width: 50, total: total});
    console.log(blue.bgBlue.bold("🔍 Retrieving All Contract list (token included)..."))
    for (const contract of convertData) {
      await sleep(100)
      const query = `module=account&action=tokenlist&address=${contract}&page=1&offset=9999`;
      try {
          const response = await axios.get<Response>(baseUrl + query);
          if (response.data.status === '1') {
            if(response.data.result === null || response.data.result === undefined || response.data.result.length === 0)
              continue;

            result.push({
              caAddress: contract,
              tokens: response.data.result
            })  
          } else {
            // console.error('Failed to fetch data:', response.data.message);
          }  
        
      } catch (error) {
          // console.error('Error fetching data:', error);
      }
      bar.tick();
    }
  } else return convertData;
  
  return result
}

/**
 * .
 * 
 * @param {integer} page - A nonnegative integer that represents the page number to be used for pagination. 'offset' must be provided in conjunction.
 * @param {integer} offset - A nonnegative integer that represents the maximum number of records to return when paginating. 'page' must be provided in conjunction.
 * @param {any} weth - L2 WETH address, default value ENV L2_WETH_ADDRESS
 */
const getCollectWETH = async(page:number, offest:number, weth?:any) => {
  const data:any =[]; 
  weth = weth? weth : WETH;
  for(let i = 1 ; i <= page; i++){
    try {
      const query = `module=token&action=getTokenHolders&contractaddress=${weth}&page=${i}&offset=${offest}`;
      const response = await axios.get<Response>(baseUrl + query);
      console.log(baseUrl+query)
      if (response.data.status === '1') {
        if(response.data.result === null || response.data.result === undefined || response.data.result.length === 0)
          continue

        data.push(...response.data.result);
      } else {
        // console.error('Failed to fetch data:', response.data.message);
      }  
    }catch (error) {
        // console.error('Error fetching data:', error);
    }
  }

  const result0:User[] = []; // EOA
  const result1:User[] = []; // CA - POOL
  const result2:User[] = []; // CA - NOT POOL
  for(const item of data){
  
      if(await L2PROVIDER.getCode(item.address) === '0x'){
        result0.push({
          claimer: item.address,
          amount: item.value,
          type:  0
        })
      }else{
        const poolContract = new ethers2.Contract(item.address, Pool, L2PROVIDER); 
        try{
          await poolContract.liquidity()
          result1.push({
            claimer: item.address,
            amount: item.value,
            type:  1
          })
        }catch(err){
          result2.push({
            claimer: item.address,
            amount: item.value,
            type: 2
          })
        }

      }
  }
  return [result0, result1, result2]
}


// getTotalAddressAll(1,1000)
// getContractAll(1,1000,true)
// getCollectWETH(1,1000)
