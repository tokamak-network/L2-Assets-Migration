const hre = require("hardhat");
const { ethers } = hre;
const fs = require('fs');

/**
 * ETH, TON, TOS, DOC, AURA, USDC, USDT 를 사용한 계정 주소를 집계합니다.
 */


// titan-sepolia
const TON = "0x7c6b91d9be155a6db01f749217d76ff02a7227f2"
const TOS = "0xd08a2917653d4e460893203471f0000826fb4034"
const USDC = "0xB79DcFE624D0A69c5c2a206a99F240f1d2Ca1D80"
const USDT = "0x79E0d92670106c85E9067b56B8F674340dCa0Bbd"
const DOC = "0x50c5725949a6f0c72e6c4a641f24049a917db0cb"
const AURA = "0xe7798f023fc62146e8aa1b36da45fb70855a77ea"
const WETH = "0x4200000000000000000000000000000000000006"
const pauseBlock = 17923 //17923
const startBlock = 0

// // titan
// const TON = "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2"
// const TOS = "0xd08a2917653d4e460893203471f0000826fb4034"
// const USDC = "0x46BbbC5f20093cB53952127c84F1Fbc9503bD6D9"
// const USDT = "0x2aCC8EFEd68f07DEAaD37f57A189677fB5655B46"
// const WETH = "0x4200000000000000000000000000000000000006"
// const DOC = "0x0000000000000000000000000000000000000000"
// const AURA = "0x0000000000000000000000000000000000000000"
// const pauseBlock = 6374
// const startBlock = 0

async function getBalances(tokenSymbol, tokenAddress, blockNumber, accounts, readFileBool) {
    const networkName = hre.network.name
    const curBlock = blockNumber

    if (readFileBool) {
      let readFile = "./data/accounts/"+hre.network.name+"_accounts.json"
      accounts = JSON.parse(await fs.readFileSync(readFile));
    }
    console.log("accounts.length", accounts.length)

    const TOS_ABI = require("../abi/TOS.json")
    const tokenContract = new ethers.Contract(
        tokenAddress,
        TOS_ABI.abi,
        ethers.provider
    );
    let balances = {}
    let sum = ethers.BigNumber.from("0")

    for (const account of accounts) {
        let balance = await tokenContract.balanceOf(account)
        sum = sum.add(balance)
        balances[account] =  balance.toString()
    }
    console.log(balances)
    console.log("sum", ethers.utils.formatUnits(sum, 18) )
    let totalSupply = await tokenContract.totalSupply()
    console.log("totalSupply", ethers.utils.formatUnits( totalSupply, 18))

    console.log("totalSupply.sub(sum)", ethers.utils.formatUnits(totalSupply.sub(sum), 18) )

    let outFile = "./data/balances/"+networkName+"_"+tokenSymbol+"_"+blockNumber+".json"
    await fs.writeFileSync(outFile, JSON.stringify(balances));

    return { outFile, balances}
}

async function checkContracts() {

  let accounts = JSON.parse(await fs.readFileSync("./data/accounts/"+hre.network.name+"_accounts.json"));
  console.log("accounts.length", accounts.length)

  let eoas = []
  let contracts = []

  for (const account of accounts) {
      let code = await ethers.provider.getCode(account)
      if (code != '0x')  contracts.push(account)
      else  eoas.push(account)
  }

  console.log('eoas.length', eoas.length)
  console.log('contracts.length', contracts.length)

  let eoaFile = "./data/accounts/"+hre.network.name+"_accounts_eoa.json"
  let contractFile = "./data/accounts/"+hre.network.name+"_accounts_contract.json"
  await fs.writeFileSync(eoaFile, JSON.stringify(eoas));
  await fs.writeFileSync(contractFile, JSON.stringify(contracts));

  // console.log(contracts)
  return {eoas, contracts}
}

async function getTransferTxs(tokenSymbol, tokenAddress) {

  const networkName = hre.network.name

  const TOS_ABI = require("../abi/TOS.json")
  const tokenContract = new ethers.Contract(
    tokenAddress,
    TOS_ABI.abi,
    ethers.provider
  );

  let block = await ethers.provider.getBlock('latest');
  let start = 0;
  // let end = block.number;
  let end = pauseBlock
  console.log('end', end)
  let blockNumber = pauseBlock
  const abi = [ "event Transfer(address indexed from, address indexed to, uint256 amount)" ];
  const iface = new ethers.utils.Interface(abi);
  const transferId = ethers.utils.id("Transfer(address,address,uint256)")

  // let unit = 1000000
  let unit = 100
  let boolWhile = false
  let filter = null;

  let transactions = []

  while (!boolWhile) {
    let toBlock = start + unit;
    if(toBlock > end)  {
      toBlock = end;
      boolWhile = true;
    }

    filter = {
      address: tokenAddress,
      fromBlock: start,
      toBlock: toBlock,
      // topics: [transferId]
    };
    // console.log('filter', filter )

    const txs = await ethers.provider.getLogs(filter);

    for (const tx of txs) {
      const { transactionHash } = tx;
      // console.log('transactionHash', transactionHash )
      transactions.push(transactionHash)
    }
    start = toBlock;
    console.log('start --- ', start )
  }

  let outFile = "./data/transactions/"+networkName+"_"+tokenSymbol+"_"+blockNumber+".json"
  await fs.writeFileSync(outFile, JSON.stringify(transactions));

  return {outFile, transactions};
}

async function getTotalSupply(depositedTxs, tokenAddress) {

  let users = [];
  const TOS_ABI = require("../abi/TOS.json")
  const abi = [ "event Transfer(address indexed from, address indexed to, uint256 amount)" ];
  const iface = new ethers.utils.Interface(abi);
  const transferId = ethers.utils.id("Transfer(address,address,uint256)")

  let i = 0
  if (depositedTxs.length > 0) {
    for (const depositedTx of depositedTxs) {
      let receipt = await ethers.provider.getTransactionReceipt(depositedTx);
      console.log(receipt.blockNumber)

      const tokenContract = new ethers.Contract(
        tokenAddress,
        TOS_ABI.abi,
        ethers.provider
      );
      let totalSupply = await tokenContract.totalSupply.call({blockNumber: receipt.blockNumber})
      console.log('totalSupply --- ', receipt.blockNumber, totalSupply )

      // const { logs } = await ethers.provider.getTransactionReceipt(depositedTx);
      // const foundLog = logs.find(el => el && el.topics && el.topics.includes(transferId));
      // if (!foundLog) continue;
      // const parsedlog = iface.parseLog(foundLog);
      // const { from, to, amount } = parsedlog["args"];

      // let fromAddress = from.toLowerCase()
      // let toAddress = to.toLowerCase()

      // if(!users.includes(fromAddress)) users.push(fromAddress)
      // if(!users.includes(toAddress)) users.push(toAddress)
      // i++
      // if(i % 200 == 0) {
      //   console.log('i --- ', i )
      //   // await fs.writeFileSync("./data/depositors.json", JSON.stringify(depositors));
      // }
    }
  }

  // console.log( users )
  // await fs.writeFileSync("./data/depositors.json", JSON.stringify(depositors));
  return users
}

async function getAccounts(depositedTxs, readFile, readBool) {

  let datas
  if (readBool && readFile != null) {
    datas = JSON.parse(await fs.readFileSync(readFile));
    depositedTxs = datas
  }

  let users = [];

  const abi = [ "event Transfer(address indexed from, address indexed to, uint256 amount)" ];
  const iface = new ethers.utils.Interface(abi);
  const transferId = ethers.utils.id("Transfer(address,address,uint256)")

  let i = 0
  if (depositedTxs.length > 0) {
    for (const depositedTx of depositedTxs) {
      const { logs } = await ethers.provider.getTransactionReceipt(depositedTx);
      const foundLog = logs.find(el => el && el.topics && el.topics.includes(transferId));
      if (!foundLog) continue;
      const parsedlog = iface.parseLog(foundLog);
      const { from, to, amount } = parsedlog["args"];

      let fromAddress = from.toLowerCase()
      let toAddress = to.toLowerCase()
      if(fromAddress == toAddress) console.log('i --- ', i , "same from == to", toAddress)
      if(!users.includes(fromAddress)) users.push(fromAddress)
      if(!users.includes(toAddress)) users.push(toAddress)
      i++
      if(i % 200 == 0) {
        console.log('i --- ', i )
        // await fs.writeFileSync("./data/depositors.json", JSON.stringify(depositors));
      }
    }
  }

  // console.log( users )
  await fs.writeFileSync("./data/accounts/"+hre.network.name+"_accounts.json", JSON.stringify(users));
  return users
}

async function getTitanSepoliaAccounts() {
  const datas = JSON.parse(await fs.readFileSync("./data/state-titan-sepolia-latest.json"));
  let accounts = Object.entries(datas.accounts)
  let users = []
  let j = 0
  //------------------
  for (j = 0; j < accounts.length; j++) {

    let a = accounts[j][0].toLowerCase()

    if(!users.includes(a)) users.push(a)
  }
  // console.log('users length', users.length)

  await fs.writeFileSync("./data/state-titan-sepolia-accounts.json", JSON.stringify(users));
  return users
}

async function checkAccounts(accounts) {
  const sepolia_users = JSON.parse(await fs.readFileSync("./data/state-titan-sepolia-accounts.json"));
  let unKnownUsers = []
  let j = 0
  for (j = 0; j < accounts.length; j++) {

    let a = accounts[j].toLowerCase()

    if(!sepolia_users.includes(a)) unKnownUsers.push(a)
  }
  return unKnownUsers
}

async function checkAccounts2(accounts) {
  const sepolia_users = JSON.parse(await fs.readFileSync("./data/state-titan-sepolia-accounts.json"));
  let unKnownUsers = []
  let j = 0
  for (j = 0; j < accounts.length; j++) {

    let a = sepolia_users[j].toLowerCase()

    if(!accounts.includes(a)) unKnownUsers.push(a)
  }
  return unKnownUsers
}

async function getBalanceAndTotalUsingTransferEvent(TokenSymbol, TokenAddress) {

    console.log("--- "+TokenSymbol+" ----");
    let fileMode = true

    if (fileMode) {
      let transactionFile ='./data/transactions/titansepolia_'+TokenSymbol+'_'+pauseBlock+'.json'
      await getAccounts(null, transactionFile, fileMode);
      await getBalances (TokenSymbol, TokenAddress, pauseBlock, null, fileMode)

    } else {
      let accountsTON = await getAccounts(out.transactions, null, fileMode);
      console.log("accountsTON.length", accountsTON.length);
      await getBalances(TokenSymbol, TokenAddress, pauseBlock, accountsTON, fileMode)
    }
}

async function getBalanceUsingStateDump() {

    // const accountAll = await getTitanSepoliaAccounts()
    // await getBalances("TON", TON, pauseBlock, accountAll)

    const unKnownUsers1 = await checkAccounts(accountsTON)
    console.log("unKnownUsers1.length", unKnownUsers1.length);
    console.log("unKnownUsers1", unKnownUsers1);

    const unKnownUsers2 = await checkAccounts2(accountsTON)
    console.log("unKnownUsers2.length", unKnownUsers2.length);
    console.log("unKnownUsers2", unKnownUsers2);

    // const unKnownUsers = await checkAccounts(accountsTON)
    // const unKnownUsers = await checkAccounts2(accountsTON)
    // console.log("unKnownUsers.length", unKnownUsers.length);
    // console.log("unKnownUsers", unKnownUsers);

    // const missings = [
    //   '0x0017184099790fc5f760cc4abd2fd2a1dc0c9536',
    //   '0x01093fd8c257c6fae9df4309fdaa6c2eef276900',
    //   '0x01297d4ac852cae1cff2bb7626400e48a66f63c3',
    //   '0x01472fe78e3179e1d11d912d22db6951b507a68a',
    //   '0x01f3239898df4fd2b54a5030f515b4280f78ec8d',
    //   '0x020edd1b25e64c6df3f30e2891b989a91d1ffbd1',
    //   '0x0252d3e50738ab3237eb6d586fb5c006062b1dea',
    //   '0x026510c75290c6ef53027494f1b784d8982f5441',
    //   '0x02810688dd4679d6730c9f953978970cee6b5d4f',
    //   '0x03495afed63d688c3f6ce65703854d8fdd2b5b35',
    //   '0x0376e73c020584b98688d15d87d5528068546ac9',
    //   '0x03e9d51654a5e3071e26ccadd379d81c7cd2e50d',
    //   '0x03f0e138bfe49c206ce8368be94ba87c8e103bde',
    //   '0x03f55c5cf1a719902f0c8facce477e8227428f76',
    //   '0x041038d9693aae531d1ce27b75d3478359875cee',
    //   '0x047bb35c40231b557719864e24f248a13aefb179',
    //   '0x049bf8c1291938ae5a8cbb109062a91af3a153e5',
    //   '0x0515cbc459a2795b3d74933ebf34cc0f0f74856b',
    //   '0x0686e1e390246d2dd257ba02a47e5ce7e2c159e4',
    //   '0x06ad364247b4f8e491ce401b6dd7552b8ed289de',
    //   '0x0701c8c03b1aa9229a4dff0af021bab7d002a10d',
    //   '0x07562f63b1862fe30c01556b8eeab97cf260a8cf',
    //   '0x0776e62235955c3d87568fb91fc3b5fef026d4f4',
    //   '0x077f923efb774f8dbcb2cb1f93dd1d4b893c1177',
    //   '0x07877fa4e98d4e38585c5f0955f1c1785276228a',
    //   '0x07c5e5694596000038b82203a2b1436a3e026e0a',
    //   '0x08821e390c3a8a4f36e8c1fdf32d1c28795141a3',
    //   '0x08f5d651f68b81bda695c175ea5040e377b999e6',
    //   '0x09046cad6e5acc033dfd522cd8136f4ff246bacf',
    //   '0x0997a0d4b7d6927c9abb8b53ec2803ffe16577b1',
    //   '0x09dc690b70711e1fe5e1045fd00f3dcbf18f16e8',
    //   '0x0a1faa1489215449b4e647b5cc40f644c4acdacf',
    //   '0x0a7fe8dfb76e41e88730e8e5f6812d3a7242adbc',
    //   '0x0b5274c60abfc550c7c137e27a92f853da7921a9',
    //   '0x0b5ef4f57364482960f8d0c661f0a41919adb39c',
    //   '0x0b61827b9cf870fc729653e1adb55e5b1e2d839b',
    //   '0x0c15c9271cb6e44515244322e9e1e1181ff68a3e',
    //   '0x0c448437edcb2a093266df30619924ae8131b9e3',
    //   '0x0c68da076ccb17d578ebaf5765dbd849e4725b3f',
    //   '0x0c7169d54c5f718a4af9b91764d7616fca6dcc50',
    //   '0x0c847f8be1db9206bfa1479bcecdfb81a5e11776',
    //   '0x0d8ee722295a7bf53cb0e2d66f397f1a1e328f3a',
    //   '0x0e24022d12afd94559eb82878ba2edaa32a630b7',
    //   '0x0e3a82db56c11b75b09310633bd045dafa27423c',
    //   '0x0e71723c42f3c305638d746723a8cd68abdb253a',
    //   '0x0e891b7e8ac412a99bf99313b155cec2ec607b54',
    //   '0x0ebd097cbd911e5a5dc401d7c91f71b47f0ee178',
    //   '0x0ec0e4850c4d97a0237a82431574b6bfa405237e',
    //   '0x0ee4e6546e0687b5133fb07a2a25952bcfaa4a8f',
    //   '0x0f24ffa71ccffa363fd50f0951b409ee43cafd5b',
    //   '0x0f4f8485d10d720a84bce17dc6c07da06e7b2973',
    //   '0x0f69941aef5e33d504359f8452ae7f41acd72745',
    //   '0x0f93d2937a0e75bd2d841c97d167cd4f67d28744',
    //   '0x0fc9adf4143dd0e3e024576820f32e39ce0703bf',
    //   '0x0ff0ec204eeeab2a0ecacfa6b1c1506fe9da886d',
    //   '0x1044e28bd30bb231bfe6658aa724b37e71189ee8',
    //   '0x11075399ea88f44d73fd5f4f0b3c3ce3ea563859',
    //   '0x117b65cd97f11745abd50f362f7d227a106d6c33',
    //   '0x12566983fa972e68db36e008412058c7aff874b3',
    //   '0x129286c288228a462b107a526182bc91da7e3357',
    //   '0x1308940bb45ce6136bcc4a4a0c3cb9586094afd7',
    //   '0x13175e52e9791c155c78bf59e690bd106f5c1328',
    //   '0x136827ace28b05263b3fdd550039bdfd21e4ad5f',
    //   '0x139d8fc702f01986a501e0e15fb5dd506beb5367',
    //   '0x13bcb866d580ffe070f6fa8fb7e23e1a05a96a85',
    //   '0x14806e22206ba2e90a4569349131124bfc7065b3',
    //   '0x14ce092429737da612754358fb6da10ac46f2e22',
    //   '0x14db65efa498b0609a4a8bb29a7c826367876c32',
    //   '0x152c3a5236094258e98a23d5b66978759de9908c',
    //   '0x15883e811648598eab1dfbd94376f150b0f72e5a',
    //   '0x15a809498dc6e4d64525d654cb38550a65ddc112',
    //   '0x15b46be5dfd669ddd016ca8a6aecaf0ae7273ca9',
    //   '0x164637e4fa98f6049833544111700f804031c50c',
    //   '0x164655403242fffee368d5bf3e7564d1fcc7893b',
    //   '0x16744c078e0a8bc4455ae5205023b312f6dc6365',
    //   '0x169507b0a64587f8699f7d1d9304a833ad884ef9',
    //   '0x16a272cc71dc2f46156562dccadc0e6710264016',
    //   '0x16ed250f40ee25b79a76215124dbf6d00ca1a375',
    //   '0x16f39d0d91bb6234a2e2660fbddcbf5b8ddafc18',
    //   '0x1723c153e86d589ce1c7478295bba783a2df9dd7',
    //   '0x176e8c25934c264bfd4533bccf758f333a8fb91e',
    //   '0x17b3e73833880ab6e8a632220968f9371cb533bf',
    //   '0x17dd980926d433fb6c6824d7b6cd3553d185dab4',
    //   '0x180a1b275b3e98f80313e6d0d7ddc61a8b492527',
    //   '0x18299eec35afb6f18284c6d927fddf57ca6cffcf',
    //   '0x18a8c120fd2630d0b99a8c94a5a1274e9a3d4c1d',
    //   '0x18b02000d2ba5e45f27419830576009addd0bb82'
    // ]
}

async function main() {

    // await getBalanceAndTotalUsingTransferEvent("TON", TON)

    await checkContracts()

    // await getBalanceUsingStateDump()
    // const accountAll = await getTitanSepoliaAccounts()
    // await getBalances("TON", TON, pauseBlock, accountAll)


    // console.log("--- TON ----");
    // let depositedTxs1 = await getTransferTxs(TON);
    // let accountsTON = await getAccounts(depositedTxs1);


    // await getBalances("TON", TON, pauseBlock, missings)


    // console.log("accountsTON.length", accountsTON.length);
    // await getBalances("TON", TON, pauseBlock, accountsTON)

    // console.log("--- TOS ----");
    // let depositedTxs2 = await getTransferTxs(TOS);
    // let accountsTOS = await getAccounts(depositedTxs2);
    // console.log("accountsTOS.length", accountsTOS.length);

    // console.log("--- USDC ----");
    // let depositedTxs3 = getTransferTxs(USDC);
    // let accountsUSDC = await getAccounts(depositedTxs3);
    // console.log("accountsUSDC.length", accountsUSDC.length);

    // console.log("--- USDT ----");
    // let depositedTxs4 = getTransferTxs(USDT);
    // let accountsUSDT = await getAccounts(depositedTxs4);
    // console.log("accountsUSDT.length", accountsUSDT.length);

    // console.log("--- WETH ----");
    // let depositedTxs7 = getTransferTxs(WETH);
    // let accountsWETH = await getAccounts(depositedTxs7);
    // console.log("accountsWETH.length", accountsWETH.length);

    // console.log("--- DOC ----");
    // if (DOC != "0x0000000000000000000000000000000000000000"){

    //   let depositedTxs5 = getTransferTxs(DOC);
    //   let accountsDOC = await getAccounts(depositedTxs5);
    //   console.log("accountsDOC.length", accountsDOC.length);
    // }

    // console.log("--- AURA ----");

    // if (DOC != "0x0000000000000000000000000000000000000000"){

    //   let depositedTxs6 = getTransferTxs(AURA);
    //   let accountsAURA = await getAccounts(depositedTxs6);
    //   console.log("accountsAURA.length", accountsAURA.length);
    // }

  }

  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });

