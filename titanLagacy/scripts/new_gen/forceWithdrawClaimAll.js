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
    let getAccount
    let getAddress
    let getClaimHash
    let testZeroAddr = "0x0000000000000000000000000000000000000000";
    let tokenContract

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
  
                  getAccount = await ethers.getSigner(Account);
  
                  getAddress = await UpgradeL1BridgeLogic.connect(tester).getForcePosition(Hash)
              
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
  
                          getClaimHash = await UpgradeL1BridgeLogic.connect(tester).claimState(Hash)
                          expect(getClaimHash).to.be.equal(false)
                          
                          // console.log("Account["+k+"] :", Account);
                          let beforeAmount = await getAccount.getBalance()
  
                          await UpgradeL1BridgeLogic.connect(tester).forceWithdrawClaim(
                              positionAddress,
                              Hash,
                              tokenAddr,
                              Amount,
                              Account
                          )
  
                          let afterAmount = await getAccount.getBalance()
                          if(Number(afterAmount) <= Number(beforeAmount)) {
                              console.log("Account["+k+"] :", Account);
                              console.log("Hash :", Hash);
                          }
      
                          getClaimHash = await UpgradeL1BridgeLogic.connect(tester).claimState(Hash)
                          expect(getClaimHash).to.be.equal(true)
                          
                          await expect(
                              UpgradeL1BridgeLogic.connect(tester).forceWithdrawClaim(
                                  positionAddress,
                                  Hash,
                                  tokenAddr,
                                  Amount,
                                  Account
                              )
                          ).to.be.rejectedWith("already claim Hash")
                      }
                  } else {
                      console.log("k : ", k);
                      console.log("Account is ZeroAddr : ", Account, ", Hash :", Hash);
                  }
              }
          } else {
              tokenContract = new ethers.Contract(
                  tokenAddr,
                  TON_ABI.abi,
                  tester
              ) 
  
              for(let j = 0; j < assets[i].data.length; j++) {
                  if(j == 0){
                      console.log("data.length :", assets[i].data.length)
                  }
                  Account = assets[i].data[j].claimer
                  Amount = ethers.BigNumber.from(assets[i].data[j].amount)
                  Hash = assets[i].data[j].hash
                  
  
                  getAddress = await UpgradeL1BridgeLogic.connect(tester).getForcePosition(Hash)
                  
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
  
                          getClaimHash = await UpgradeL1BridgeLogic.connect(tester).claimState(Hash)
                          expect(getClaimHash).to.be.equal(false)
  
                          let beforeAmount = await tokenContract.balanceOf(Account)
  
                          await UpgradeL1BridgeLogic.connect(tester).forceWithdrawClaim(
                              positionAddress,
                              Hash,
                              tokenAddr,
                              Amount,
                              Account
                          )
      
                          let afterAmount = await tokenContract.balanceOf(Account)
                          
                          expect(afterAmount).to.be.gt(beforeAmount)
  
                          getClaimHash = await UpgradeL1BridgeLogic.connect(tester).claimState(Hash)
                          expect(getClaimHash).to.be.equal(true)
  
                          await expect(
                              UpgradeL1BridgeLogic.connect(tester).forceWithdrawClaim(
                                  positionAddress,
                                  Hash,
                                  tokenAddr,
                                  Amount,
                                  Account
                              )
                          ).to.be.rejectedWith("already claim Hash")
                      }
                  }
      
              }
          }
  
      }
    }

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
