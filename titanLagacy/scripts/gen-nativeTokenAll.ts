import fs from 'fs'
import path from 'path'
import { ethers as ethers2 } from 'ethers2';
import { ethers } from "ethers";
import { BatchCrossChainMessenger, MessageStatus} from "@tokamak-network/titan-sdk"
import { L2Interface, WithdrawClaimed } from './types';
import { blue } from 'console-log-colors';
import { Client, cacheExchange, fetchExchange } from '@urql/core';
import * as dotenv from 'dotenv';


const L2PROVIDER = new ethers.providers.JsonRpcProvider(process.env.CONTRACT_RPC_URL_L2 || ""); // L2 RPC URL
const L2BRIDGE = process.env.CONTRACTS_L2BRIDGE_ADDRESS || ""; // L2 bridge address
const dirPath = "data"

export const getTotalAddress = async() => {
    const latest = await L2PROVIDER.getBlockNumber()
    let historyAddressList:any = [];

    for(let i = 1; i < latest; i++) {
        const block = await L2PROVIDER.getBlockWithTransactions(i)
        for(const tx of block.transactions){
            historyAddressList.push(tx.to)
            historyAddressList.push(tx.from)
        }
        console.log(i)
    }
    historyAddressList = Array.from(new Set(historyAddressList))
    console.log("TOTAL ADDRESS => ",historyAddressList.length)

    fs.mkdir(dirPath, { recursive: true }, (err) => {
        if (err) {
          console.log(err);
          process.exit(1);
        }
        fs.writeFile(path.join(dirPath, 'generate-assets1.json'), JSON.stringify(historyAddressList, null, 1) , 'utf-8', (err)=>{
          if(err) {
              console.log(err);
              process.exit(1);
          }
        }) 
        console.log(blue.bgBlue.bold("📝 Generate 'assets1.json' File complete!"))
        console.log("\n")
    })
}

getTotalAddress()
