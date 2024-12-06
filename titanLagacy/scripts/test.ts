import { BatchCrossChainMessenger, MessageStatus } from "@tokamak-network/titan-sdk"
import { ethers } from "ethers";

const addHexPrefix = (privateKey: any) => {
  if (privateKey.substring(0, 2) !== "0x") {
    privateKey = "0x" + privateKey
  }
  return privateKey
}

const main = async () => {
    const l1 = "https://sepolia.infura.io/v3/23dce4bf27f348768642da20c08697ed"
    const l2 = "https://rpc.titan-sepolia.tokamak.network"
    const pk = "d9fe15d373dc896d5e5585bc214f9b51ceea5db0a554a0798c70b4c43dbfacd2" 

    const l2Provider = new ethers.providers.JsonRpcProvider(l2);
    const l2wallet = new ethers.Wallet(addHexPrefix(pk) || "", l2Provider);
    const l1Provider = new ethers.providers.JsonRpcProvider(l1);
    const l1wallet = new ethers.Wallet(addHexPrefix(pk) || "", l1Provider);
  
    const crossDomainMessenger = new BatchCrossChainMessenger({
      l1SignerOrProvider: l1wallet,
      l2SignerOrProvider: l2wallet,
      l1ChainId: 11155111,
      l2ChainId: 55007,
      bedrock: false
    })
}

main()

