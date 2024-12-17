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
    console.log("--- getBalances : ", tokenSymbol)

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
    // console.log(balances)
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

async function getAccounts(depositedTxs, readFile, readBool, appendMode ) {

  let accountFile = "./data/accounts/"+hre.network.name+"_accounts.json"
  let oldAccounts = [] ;

  if (await fs.existsSync(accountFile)) oldAccounts = JSON.parse(await fs.readFileSync(accountFile));

  let datas
  if (readBool && readFile != null) {
    datas = JSON.parse(await fs.readFileSync(readFile));
    depositedTxs = datas
  }

  let users = [];
  if(appendMode) users = oldAccounts

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

async function getAccountsUsingTransferEvent(tokenSymbol, tokenAddress) {
    console.log("--- "+tokenSymbol+" ----");
    let appendModeAccount = true
    let fileMode = true

    let transactionFile ='./data/transactions/'+hre.network.name+'_'+tokenSymbol+'_'+pauseBlock+'.json'
    await getTransferTxs(tokenSymbol, tokenAddress)
    await getAccounts(null, transactionFile, fileMode, appendModeAccount);
}


async function main() {

    // get transactions and accounts
    // await getAccountsUsingTransferEvent("TON", TON)
    // await getAccountsUsingTransferEvent("TOS", TOS)
    // await getAccountsUsingTransferEvent("USDC", USDC)
    // await getAccountsUsingTransferEvent("USDT", USDT)
    // await getAccountsUsingTransferEvent("WETH", WETH)
    // await getAccountsUsingTransferEvent("DOC", DOC)
    // await getAccountsUsingTransferEvent("AURA", AURA)

    // divide the accounst with eoa ans contract
    // await checkContracts()

    // get the balances
    let fileMode = true
    // await getBalances ("TON", TON, pauseBlock, null, fileMode)
    await getBalances ("TOS", TOS, pauseBlock, null, fileMode)
    await getBalances ("USDC", USDC, pauseBlock, null, fileMode)
    await getBalances ("USDT", USDT, pauseBlock, null, fileMode)
    await getBalances ("WETH", WETH, pauseBlock, null, fileMode)
    await getBalances ("DOC", DOC, pauseBlock, null, fileMode)
    await getBalances ("AURA", AURA, pauseBlock, null, fileMode)

  }

  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });

