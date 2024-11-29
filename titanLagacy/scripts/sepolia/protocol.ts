import { ethers } from "hardhat";
import fs from 'fs'
import path from 'path'
import { deploy } from "@nomicfoundation/ignition-core";
import { BigNumber } from "ethers";

const deployerSigner = process.env.SEPOLIA_ACCOUNT //  deployer and owner
const deployerAddress = "0x6526728cfDcB07C63CA66fE36b5aA202067eE75b" // deployer and owner
const l1BridgeAddress = "0x72855Bd554170BcdB9e1e5d04831E767021DA9B9"

const RegistryStorage = async (opt?: boolean) => {
    const deployer:any = await ethers.provider.getSigner(0)

    const fwStorage = require("../../artifacts/contracts/data/sepolia/GenFWStorage1.sol/GenFWStorage1.json");

    const storageContract = await (await ethers.getContractFactory(
            fwStorage.abi,
            fwStorage.bytecode,
            deployer as any
        )
    ).deploy()
    
    const storageAddress = (await storageContract.deployed()).address 
    const deployedContact = [] 
    deployedContact.push(storageAddress)

    console.log(storageAddress)
    
    const l1Bridge = await ethers.getContractAt("MockL1StandardBridge", l1BridgeAddress)
    await l1Bridge.connect(deployer).forceRegistry(deployedContact)
    
    // console.log(await l1Bridge.positions(0))
    // console.log(await l1Bridge.positions(1))
    // console.log(await l1Bridge.positions(2))
    // console.log(await l1Bridge.positions(3))
    // console.log(await l1Bridge.positions(4))
    // console.log(await l1Bridge.positions(5))
    // console.log(await l1Bridge.position("0x6D543B2407B22CbA62813D05E7E5427F7BB38752"))
    
}

const ForceModify = async () => {
    const deployer:any = await ethers.provider.getSigner(0)
    const l1Bridge = await ethers.getContractAt("MockL1StandardBridge", l1BridgeAddress)
    await l1Bridge.connect(deployer).forceModify([
        {
            position: "0x06296cdb81367f0cDa4B29a8f290Ee6a5955EB70",
            state : false 
        },
        {
            position: "0x0dd3e5e89AD43A2E5E2e511B218524F294c38970",
            state : false 
        },
        {
            position: "0x14E3751467Fbe916C7fc370b7903115f001b7DFd",
            state : false 
        },
        {
            position: "0x6D543B2407B22CbA62813D05E7E5427F7BB38752",
            state : false 
        }
    ])
}


const DummyData = async () =>{
    
    // const testOwner1 = "0xe6BDAB42d78C635502f5ef5707Ac1e4524C1E9A9" // testAccount1, for victor
    const testOwner1 = "0x90F281ccEDD4366c8cCA81d2ba3D54A808Baa806" // testAccount2
    const dirPath = "data"
    let jsonData = fs.readFileSync(path.join(dirPath, 'generate-assets2.json'), "utf-8")
    let assetsData = JSON.parse(jsonData)
    const outContract = [];
    const baseETH = 1000;
    let baseERC20 = 1000.000001;
    let decimalERC20 = 0.00001;
    let baseStable = 100.0001;
    let decimalStable = 0.001;
    let nonceCouter = 1.0;

    for (const data of assetsData.data) {
        let l1Token = data.l1Token
        
        if(data.tokenName === ("Tokamak Network")){
            l1Token = "0xe7070AE4d3506dC9b772d714b6c427658D45c03e"
        }else if (data.tokenName === ("TONStarter")){
            l1Token = "0x728eE535E5042fA15bCaE482c4DD35983C9b07aD"
        }else if (data.tokenName === ("USD Coin")){
            l1Token = "0x416cFF32947E2b42Fa70f972B18bffFC7239c456"
        }else if (data.tokenName === ("Tether USD")){
            l1Token = "0xE83D8Bc8b7Bfd211d1848d5eE749D9c635d30bE6"
        }
        
        const inner = {
            l1Token: l1Token,
            l2Token: data.l2Token,
            tokenName: data.tokenName,
            data: new Array()
        }

      for (let i = 0 ; i < 30; i++) {
        nonceCouter += 1.0;
    
        if(l1Token == "0x0000000000000000000000000000000000000000") {
            inner.data.push({
                "claimer": testOwner1,
                "amount": baseETH + nonceCouter,
                "hash": ethers.utils.solidityKeccak256(['address', 'address', 'uint256'], [l1Token, testOwner1, baseETH + nonceCouter])
            })
        }else if( l1Token === "0xe7070AE4d3506dC9b772d714b6c427658D45c03e"  || l1Token === "0x728eE535E5042fA15bCaE482c4DD35983C9b07aD"){ // ton, tos 
            decimalERC20 += 0.00001;
            const bal = baseERC20 + nonceCouter + decimalERC20;
            const unitBal = ethers.utils.parseUnits(bal.toString(),18).toString();
            inner.data.push({
                "claimer": testOwner1,
                "amount": unitBal,
                "hash": ethers.utils.solidityKeccak256(['address', 'address', 'uint256'], [l1Token, testOwner1, unitBal])
            })
        } else if( l1Token === "0x416cFF32947E2b42Fa70f972B18bffFC7239c456" || l1Token === "0xE83D8Bc8b7Bfd211d1848d5eE749D9c635d30bE6" ){ // usdc, usdt
            decimalStable += 0.001;
            const bal = baseStable + nonceCouter + decimalStable;
            const unitBal = ethers.utils.parseUnits(bal.toFixed(6),6).toString();

            inner.data.push({
                "claimer": testOwner1,
                "amount": unitBal,
                "hash": ethers.utils.solidityKeccak256(['address', 'address', 'uint256'], [l1Token, testOwner1, unitBal])
            })
        }
      }
      outContract.push(inner)
    }
    fs.writeFile(path.join(dirPath, 'sepolia-generate-assets3.json'), JSON.stringify(outContract, null, 1), 'utf-8', (err) => {
      if (err) {
        console.log(err);
      }
    })


}
// DummyData();
RegistryStorage();
// ForceModify();

// npx hardhat verify --network sepolia <proxy_contract_address>
