const { ethers, run } = require("hardhat");
const fs = require('fs');
const axios  = require('axios');
const { BigNumber } = require("ethers")

const UpgradeL1BridgeV1_ABI = require("../../artifacts/contracts/UpgradeL1BridgeV1.sol/UpgradeL1BridgeV1.json")

async function forceWithdrawClaimAll() {
    const [deployer] = await ethers.getSigners();
    console.log("deployer Address : ", deployer.address)

    let UpgradeL1BridgeProxyAddr = "0x59aa194798Ba87D26Ba6bEF80B85ec465F4bbcfD"
    
    //==== set UpgradeL1BridgeProxy =================================
    let UpgradeL1BridgeLogic = new ethers.Contract(
      UpgradeL1BridgeProxyAddr,
      UpgradeL1BridgeV1_ABI.abi,
      tester
    )

    let yourAddr = ["", ""]

    let readFile1 ='./data/titan_new-generate-assets.json'
    let assets
    if (await fs.existsSync(readFile1)) assets = JSON.parse(await fs.readFileSync(readFile1));

    let tokenAddr
    let Hash
    let Account
    let Amount
    let getAddress
    let getClaimHash
    let testZeroAddr = "0x0000000000000000000000000000000000000000";

    let positionAddress = GenBridgeStorage1Contract.address

    for(let m = 0; m < yourAddr.length; m++) {
      for(let i = 0; i < assets.length; i++) {
          tokenAddr = assets[i].l1Token
          console.log("tokenAddr : ", tokenAddr);
          if (tokenAddr == l1ETH) {
              for(let k = 0; k < assets[i].data.length; k++) {
                  if(k == 0){
                      console.log("data.length :", assets[i].data.length)
                  }
  
                  Account = assets[i].data[k].claimer

                  if(Account != yourAddr[m]){
                    continue;
                  }

                  Amount = ethers.BigNumber.from(assets[i].data[k].amount)
                  Hash = assets[i].data[k].hash

                  console.log("-----------------------------------------")
                  console.log("input param Hash :", Hash)
                  console.log("-----------------------------------------")
    
                  getAddress = await UpgradeL1BridgeLogic.connect(deployer).getForcePosition(Hash)
              
                  if(getAddress == testZeroAddr) {
                      console.log("Account : ", Account)
                      console.log("error :", Hash)
                      continue;
                  }
  
                  if(Account.toUpperCase() != testZeroAddr.toUpperCase()){
                      let code = await ethers.provider.getCode(Account);
                      if (code !== '0x') {
                          console.log("k : ", k);
                          console.log("Account is Contract : ", Account);
                      } else {
                          if(Hash == "0x172665f9d91a10c9051e7851268413e8d5c31a04c6d17956ad464598a8e44969"){
                              positionAddress = GenBridgeStorage2Contract.address
                          }

                          getClaimHash = await UpgradeL1BridgeLogic.connect(deployer).claimState(Hash)
                          
                          if(getClaimHash == true){
                            console.log("already claim Hash :", Hash)
                            continue;
                          }
                          
                          params.push({
                            "position": positionAddress,
                            "hashed": Hash,
                            "token" : tokenAddr,
                            "amount" : Amount,
                            "getAddress" : Account
                        })
                      }
                  } else {
                      console.log("k : ", k);
                      console.log("Account is ZeroAddr : ", Account, ", Hash :", Hash);
                  }
              }
          } else {
              for(let j = 0; j < assets[i].data.length; j++) {
                  if(j == 0){
                      console.log("data.length :", assets[i].data.length)
                  }
                  Account = assets[i].data[j].claimer

                  if(Account != yourAddr[m]){
                    continue;
                  } 

                  Amount = ethers.BigNumber.from(assets[i].data[j].amount)
                  Hash = assets[i].data[j].hash
                  console.log("-----------------------------------------")
                  console.log("input param Hash :", Hash)
                  console.log("-----------------------------------------")
  
                  getAddress = await UpgradeL1BridgeLogic.connect(deployer).getForcePosition(Hash)
                  
                  if(getAddress == testZeroAddr) {
                      console.log("Account : ", Account)
                      console.log("error :", Hash)
                      break;
                  }
        
                  if(Account.toUpperCase() != testZeroAddr.toUpperCase()){
                      let code = await ethers.provider.getCode(Account);
                      if (code !== '0x') {
                          console.log("j : ", j);
                          console.log("Account is Contract : ", Account);
                      } else {
                          if(Hash == "0x172665f9d91a10c9051e7851268413e8d5c31a04c6d17956ad464598a8e44969"){
                              positionAddress = GenBridgeStorage2Contract.address
                          }
  
                          getClaimHash = await UpgradeL1BridgeLogic.connect(deployer).claimState(Hash)
                          if(getClaimHash == true){
                            console.log("already claim Hash :", Hash)
                            continue;
                          }
  
                          params.push({
                            "position": positionAddress,
                            "hashed": Hash,
                            "token" : tokenAddr,
                            "amount" : Amount,
                            "getAddress" : Account
                        })
                      }
                  }
      
              }
          }
  
      }
    }

    console.log(params);
            
    await UpgradeL1BridgeLogic.connect(deployer).forceWithdrawClaimAll(
        params
    )

    console.log("ClaimAll pass")

}

const main = async () => {
  await forceWithdrawClaimAll()
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
