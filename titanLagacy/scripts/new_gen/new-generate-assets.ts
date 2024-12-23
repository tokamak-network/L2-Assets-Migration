import fs from 'fs'
import path from 'path'
import { ethers } from 'hardhat'
import { BigNumber } from "ethers"
import { NonfungibleTokenPositionManager, L2Interface, ERC20, L1Interface, Pool, Closed, User, WithdrawClaimed } from '../types';
import { getWithdrawalClaimStatus, getCollectWETH, getTotalAddressAll, getContractAll, bigNumberAbs } from "../forceLib";
import hre from "hardhat"

const dirPath = "data"

const main = async () => {
    let jsonData = fs.readFileSync(path.join(dirPath, '5.'+hre.network.name+'_asset_eoa.json'), "utf-8")
    let assetsData = JSON.parse(jsonData)
    const outContract = [];   
    
    console.log(assetsData.length)

    let l1TON;
    let l2TON;
    let tokenNameTON = "Tokamak Network Token"
    let l1TOS;
    let l2TOS;
    let tokenNameTOS = "TONStarter"
    let l1USDC;
    let l2USDC;
    let tokenNameUSDC = "USD Coin"
    let l1USDT;
    let l2USDT;
    let tokenNameUSDT = "Tether USD"
    let l1ETH;
    let l2ETH;
    let tokenNameETH = "Ether"

    if(hre.network.name == "titansepolia") {
        //sepolia
        l1TON = "0xa30fe40285B8f5c0457DbC3B7C8A280373c40044"
        l2TON = "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2"
        l1TOS = "0xFF3Ef745D9878AfE5934Ff0b130868AFDDbc58e8"
        l2TOS = "0xD08a2917653d4E460893203471f0000826fb4034"
        l1USDC = "0x693a591A27750eED2A0e14BC73bB1F313116a1cb"
        l2USDC = "0xFF3Ef745D9878AfE5934Ff0b130868AFDDbc58e8"
        l1USDT = "0x42d3b260c761cD5da022dB56Fe2F89c4A909b04A"
        l2USDT = "0x79E0d92670106c85E9067b56B8F674340dCa0Bbd"
        l1ETH = "0x0000000000000000000000000000000000000000"
        l2ETH = "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
    } else if (hre.network.name == "titan") {
        //mainnet
        l1TON = "0x2be5e8c109e2197d077d13a82daead6a9b3433c5"
        l2TON = "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2"

        l1TOS = "0x409c4D8cd5d2924b9bc5509230d16a61289c8153"
        l2TOS = "0xD08a2917653d4E460893203471f0000826fb4034"

        l1USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
        l2USDC = "0x46BbbC5f20093cB53952127c84F1Fbc9503bD6D9"

        l1USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7"
        l2USDT = "0x2aCC8EFEd68f07DEAaD37f57A189677fB5655B46"

        l1ETH = "0x0000000000000000000000000000000000000000"
        l2ETH = "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
    }

    if(l1ETH != "0x0000000000000000000000000000000000000000") {
        console.log("network error")
    }


    //mainnet

    const innerTON = {
        l1Token: l1TON,
        l2Token: l2TON,
        tokenName: tokenNameTON,
        data: new Array()
    }

    const innerTOS = {
        l1Token: l1TOS,
        l2Token: l2TOS,
        tokenName: tokenNameTOS,
        data: new Array()
    }

    const innerUSDC = {
        l1Token: l1USDC,
        l2Token: l2USDC,
        tokenName: tokenNameUSDC,
        data: new Array()
    }

    const innerUSDT = {
        l1Token: l1USDT,
        l2Token: l2USDT,
        tokenName: tokenNameUSDT,
        data: new Array()
    }

    const innerETH = {
        l1Token: l1ETH,
        l2Token: l2ETH,
        tokenName: tokenNameETH,
        data: new Array()
    }

    // keccak256(abi.encodePacked(_token, _claimer, _amount));
    for (let i=0; i < assetsData.length; i++) {
        if(assetsData[i].total.TON != 0){
            innerTON.data.push({
                "claimer": assetsData[i].address.account,
                "amount": assetsData[i].total.TON,
                "hash": ethers.utils.solidityKeccak256(['address', 'address', 'uint256'], [l1TON, assetsData[i].address.account, assetsData[i].total.TON])
            })
        }

        if(assetsData[i].total.TOS != 0){
            innerTOS.data.push({
                "claimer": assetsData[i].address.account,
                "amount": assetsData[i].total.TOS,
                "hash": ethers.utils.solidityKeccak256(['address', 'address', 'uint256'], [l1TOS, assetsData[i].address.account, assetsData[i].total.TOS])
            })
        }

        if(assetsData[i].total.USDC != 0){
            // console.log(assetsData[i].total.USDC)
            innerUSDC.data.push({
                "claimer": assetsData[i].address.account,
                "amount": assetsData[i].total.USDC,
                "hash": ethers.utils.solidityKeccak256(['address', 'address', 'uint256'], [l1USDC, assetsData[i].address.account, assetsData[i].total.USDC])
            })
        }

        if(assetsData[i].total.USDT != 0){
            innerUSDT.data.push({
                "claimer": assetsData[i].address.account,
                "amount": assetsData[i].total.USDT,
                "hash": ethers.utils.solidityKeccak256(['address', 'address', 'uint256'], [l1USDT, assetsData[i].address.account, assetsData[i].total.USDT])
            })
        }

        if(assetsData[i].total.TETH != 0){
            innerETH.data.push({
                "claimer": assetsData[i].address.account,
                "amount": assetsData[i].total.TETH,
                "hash": ethers.utils.solidityKeccak256(['address', 'address', 'uint256'], [l1ETH, assetsData[i].address.account, assetsData[i].total.TETH])
            })
        }

    }
    outContract.push(innerTON)
    outContract.push(innerTOS)
    outContract.push(innerUSDC)
    outContract.push(innerUSDT)
    outContract.push(innerETH)
    fs.writeFile(path.join(dirPath, hre.network.name+'_new-generate-assets.json'), JSON.stringify(outContract, null, 1), 'utf-8', (err) => {
        if (err) {
        console.log(err);
        }
    })
}

main().catch((error) => {
    console.log(error)
    process.exit(1);
  })
  