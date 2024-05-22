import fs from 'fs'
import path from 'path'
import { ethers as ethers2 } from 'ethers2';
import { ethers } from "ethers";
import { BatchCrossChainMessenger, MessageStatus} from "@tokamak-network/titan-sdk"
import { L2Interface, WithdrawClaimed } from './types';
import { blue } from 'console-log-colors';
import axios from 'axios';
import * as dotenv from 'dotenv';

/*
// Provides a function to easily obtain Ethereum balance based on Titan or track withdrawal request volume.
*/

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

export interface Account {
  address: string;
  balance: bigint;
  stale: boolean;
}

export interface Response {
  message: string;
  result: Account[];
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
 * @example
 * const txHashes = ["0x123...", "0x456..."];
 * const opts = { l1ChainId: 1, l2ChainId: 550040, bedrock: true, save: true };
 * getWithdrawalClaimStatus(txHashes, opts).then(result => console.log(result));
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
 * @example
 * const result = getWithdrawalIsClaimAll();
 * console.log(result);
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



export const getTotalAddressAll = async(page:number, offest:number) => {
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
  let totalBalance = ethers2.getBigInt(0);
  for(const account of accounts){
      totalBalance +=  ethers2.getBigInt(account.balance) 
  }
  console.log(totalBalance)
}

getTotalAddressAll(1,1000)














const main = async() => {
}
main()

