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
const pauseBlock = 17923
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


async function getBalances(tokenSymbol, tokenAddress, blockNumber, accounts) {
    const networkName = hre.network.name
    const curBlock = blockNumber

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
        balances[account]=  balance.toString()
    }
    console.log(balances)
    console.log("sum", sum.toString())
    let totalSupply = await tokenContract.totalSupply()
    console.log("totalSupply", totalSupply.toString())

    console.log("totalSupply.sub(sum)", totalSupply.sub(sum).toString())


    await fs.writeFileSync("./data/balances/"+networkName+"_"+tokenSymbol+"_"+blockNumber+".json",
      JSON.stringify(balances));

    return balances
}

async function getTransferTxsDetails(tokenAddress) {
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

  const abi = [ "event Transfer(address indexed from, address indexed to, uint256 amount)" ];
  const iface = new ethers.utils.Interface(abi);
  const transferId = ethers.utils.id("Transfer(address,address,uint256)")

  // let unit = 1000000
  let unit = 100
  let boolWhile = false
  let filter = null;

  let depositedTxs = []

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
      depositedTxs.push(transactionHash)
    }
    start = toBlock;
    console.log('start --- ', start )
  }
  // await fs.writeFileSync("./data/depositedTxs.json", JSON.stringify(depositedTxs));

  return depositedTxs;
}


async function getTransferTxs(tokenAddress) {
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


  const abi = [ "event Transfer(address indexed from, address indexed to, uint256 amount)" ];
  const iface = new ethers.utils.Interface(abi);
  const transferId = ethers.utils.id("Transfer(address,address,uint256)")

  // let unit = 1000000
  let unit = 100
  let boolWhile = false
  let filter = null;

  let depositedTxs = []

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
      depositedTxs.push(transactionHash)
    }
    start = toBlock;
    console.log('start --- ', start )
  }
  // await fs.writeFileSync("./data/depositedTxs.json", JSON.stringify(depositedTxs));

  return depositedTxs;
}

async function getAccounts(depositedTxs) {

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
  // await fs.writeFileSync("./data/depositors.json", JSON.stringify(depositors));
  return users
}


async function main() {
    console.log("--- TON ----");
    let depositedTxs1 = await getTransferTxs(TON);
    let accountsTON = await getAccounts(depositedTxs1);
    console.log("accountsTON.length", accountsTON.length);
    await getBalances("TON", TON, pauseBlock, accountsTON)

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

