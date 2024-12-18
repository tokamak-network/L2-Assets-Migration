const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require('fs');
const axios  = require('axios');
const { BigNumber } = require("ethers")
/**
 * ETH, TON, TOS, DOC, AURA, USDC, USDT 를 사용한 계정 주소를 집계합니다.
 */


// titan-sepolia
const baseUrl = "https://explorer.titan-sepolia.tokamak.network/api?"
const TON = "0x7c6b91d9be155a6db01f749217d76ff02a7227f2"
const TOS = "0xd08a2917653d4e460893203471f0000826fb4034"
const USDC = "0xB79DcFE624D0A69c5c2a206a99F240f1d2Ca1D80"
const USDT = "0x79E0d92670106c85E9067b56B8F674340dCa0Bbd"
const DOC = "0x50c5725949a6f0c72e6c4a641f24049a917db0cb"
const AURA = "0xe7798f023fc62146e8aa1b36da45fb70855a77ea"
const WETH = "0x4200000000000000000000000000000000000006"
const NonfungiblePositionManager = "0x0B4695D5EB7C4e207D1b86cfFA9Eb39db56413f2"
const UniswapV3Factory = "0x31BCECA13c5be57b3677Ec116FB38fEde7Fe1217"
const pauseBlock = 17923 //17923
const startBlock = 0

// // titan
// const baseUrl = "https://explorer.titan.tokamak.network/api?"
// const TON = "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2"
// const TOS = "0xd08a2917653d4e460893203471f0000826fb4034"
// const USDC = "0x46BbbC5f20093cB53952127c84F1Fbc9503bD6D9"
// const USDT = "0x2aCC8EFEd68f07DEAaD37f57A189677fB5655B46"
// const WETH = "0x4200000000000000000000000000000000000006"
// const DOC = "0x0000000000000000000000000000000000000000"
// const AURA = "0x0000000000000000000000000000000000000000"
// const NonfungiblePositionManager = "0xfAFc55Bcdc6e7a74C21DD51531D14e5DD9f29613"
// const UniswapV3Factory = "0x755Ba335013C07CE35C9A2dd5746617Ac4c6c799"
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

async function queryAccounts() {
  let page = 1
  let offest = 10000
  const query = `module=account&action=listaccounts&page=${page}&offset=${offest}`;
  let i = 0

  let appendMode = true

  let accountFile = "./data/accounts/"+hre.network.name+"_accounts.json"
  let oldAccounts = [] ;

  if (await fs.existsSync(accountFile)) oldAccounts = JSON.parse(await fs.readFileSync(accountFile));
  let users = [];
  if(appendMode) users = oldAccounts

  try {
    const response = await axios.get(baseUrl + query);
    // console.log(response)

    if (response.data.status === '1') {
      let accounts = response.data.result;
      for (i = 0; i < accounts.length; i++) {
        // console.log('Accounts:', i, accounts[i], accounts[i].address);
        let a = accounts[i].address.toLowerCase()
        if(!users.includes(a)) users.push(a)
      }
    } else {
      console.error('Failed to fetch data:', response.data.message);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  console.log('users.length:', users.length);
  await fs.writeFileSync("./data/accounts/"+hre.network.name+"_accounts.json", JSON.stringify(users));

}

async function queryContracts() {

  const abi = [
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "admin",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
  ]

  let readFile ='./data/accounts/'+hre.network.name+'_accounts_contract.json'
  let contractAccounts = [] ;
  if (await fs.existsSync(readFile)) contractAccounts = JSON.parse(await fs.readFileSync(readFile));
  console.log('contractAccounts.length', contractAccounts.length)

  let balanceTON = JSON.parse(await fs.readFileSync('data/balances/'+hre.network.name+'_TON_'+pauseBlock+'.json'));
  let balanceTOS = JSON.parse(await fs.readFileSync('data/balances/'+hre.network.name+'_TOS_'+pauseBlock+'.json'));
  let balanceUSDC = JSON.parse(await fs.readFileSync('data/balances/'+hre.network.name+'_USDC_'+pauseBlock+'.json'));
  let balanceUSDT = JSON.parse(await fs.readFileSync('data/balances/'+hre.network.name+'_USDT_'+pauseBlock+'.json'));
  let balanceWETH = JSON.parse(await fs.readFileSync('data/balances/'+hre.network.name+'_WETH_'+pauseBlock+'.json'));
  let creators = JSON.parse(await fs.readFileSync('data/contracts_creator/'+hre.network.name+'.json'));

  let contractDetails = {}
  let contractNonZero = {}
  let contractToDevelopers = []
  let page = 1
  let offest = 10000
  const query = `module=contract&action=listcontracts&page=${page}&offset=${offest}`;
  let i = 0
  let contractNonZeroCount = 0
  let contractDetailsCount = 0

  try {
    const response = await axios.get(baseUrl + query);
    // console.log(response)
    if (response.data.status === '1') {
      let accounts = response.data.result;
      // console.log('Accounts:', accounts);
      for (i = 0; i < accounts.length; i++) {
        // console.log('Accounts:', i, accounts[i]);
        let a = accounts[i].Address.toLowerCase()

        contractDetails[a] = {
          name: "",
          type: "",
          TON: "0",
          TOS: "0",
          USDC: "0",
          USDT: "0",
          WETH: "0",
          owner: "",
          admin: "",
          deployer: "",
        }
        contractDetailsCount ++

        if (accounts[i].ContractName != undefined ) contractDetails[a].name = accounts[i].ContractName

        // console.log('Accounts', i, a, accounts[i].ContractName )
        let balanceBool = false
        if(balanceTON[a] != "undefined" && balanceTON[a] != "0") {
          contractDetails[a].TON = balanceTON[a]
          balanceBool = true
        }
        if(balanceTOS[a] != "undefined" &&  balanceTOS[a] != "0") {
          contractDetails[a].TOS = balanceTOS[a]
          balanceBool = true
        }

        if(balanceUSDC[a] != "undefined" &&  balanceUSDC[a] != "0")  {
          contractDetails[a].USDC = balanceUSDC[a]
          balanceBool = true
        }
        if(balanceUSDT[a] != "undefined" &&  balanceUSDT[a] != "0") {
          contractDetails[a].USDT = balanceUSDT[a]
          balanceBool = true
        }
        if(balanceWETH[a] != "undefined" &&  balanceWETH[a] != "0")  {
          contractDetails[a].WETH = balanceWETH[a]
          balanceBool = true
        }

        if(balanceBool) {
          const contract = new ethers.Contract(a, abi, ethers.provider);
          try {
            let owner = await contract.owner()
            let code = await ethers.provider.getCode(owner)
            if(code == '0x') contractDetails[a].owner = owner.toLowerCase()
            else console.log("owner is not EOA", a, owner )
          } catch(e){
            try {
              let admin = await contract.admin()
              let code = await ethers.provider.getCode(owner)
              if(code == '0x') contractDetails[a].admin = admin.toLowerCase()
              else console.log("admin is not EOA", a, admin )
            }catch(e){
              contractDetails[a].type = "developer"
              if(creators[a] != undefined && creators[a]!=null)
                contractDetails[a].deployer = creators[a].toLowerCase()
              else  {
                console.log("unknown developer of this contract", a )
                contractToDevelopers.push(a)
              }
            }
          }
          contractNonZero[a] = contractDetails[a]
          contractNonZeroCount++
        }
      }
    } else {
      console.error('Failed to fetch data:', response.data.message);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  contractNonZero["count"] = contractNonZeroCount
  contractDetails["count"] = contractDetailsCount

  let outFile1 ='./data/accounts/'+hre.network.name+'_contract_details.json'
  await fs.writeFileSync(outFile1, JSON.stringify(contractDetails));

  let outFile ='./data/accounts/'+hre.network.name+'_contract_nonZeroBalance.json'
  await fs.writeFileSync(outFile, JSON.stringify(contractNonZero));

  console.log("contractNonZero", contractNonZero)
  console.log("contractNonZeroBalance Count", contractNonZeroCount)
  console.log("unknown developer", contractToDevelopers)

}

async function divideUniswapV3PoolContracts() {

  let readFile ='./data/accounts/'+hre.network.name+'_contract_nonZeroBalance.json'
  let readLpFile ='./data/accounts/1.'+hre.network.name+'_contract_lp_tokens.json'

  let pools = {}
  let common = {}
  let json ;
  let lpTokens ;
  if (await fs.existsSync(readFile)) json = JSON.parse(await fs.readFileSync(readFile));
  if (await fs.existsSync(readLpFile)) lpTokens = JSON.parse(await fs.readFileSync(readLpFile));

  // console.log(json.count)

  var keys = Object.keys(json);
  for (var i=0; i<keys.length; i++) {
    var key = keys[i];
    // console.log("key : " + key + ", value : " + json[key])
    var obj = json[key]
    if (obj.name == "UniswapV3Pool") {
      pools[key] = obj
    } else if(lpTokens[key] != undefined) {
      pools[key] = obj
    } else if(key != "count") {
      common[key] = obj
    }
  }

  let outFile1 ='./data/accounts/2.'+hre.network.name+'_contract_pools.json'
  await fs.writeFileSync(outFile1, JSON.stringify(pools));

  let outFile ='./data/accounts/3.'+hre.network.name+'_contract_commons.json'
  await fs.writeFileSync(outFile, JSON.stringify(common));

}

async function calaculateAmountOfLps() {
  // let readFile ='./data/accounts/1.'+hre.network.name+'_contract_pools.json'
  // var pools
  // if (await fs.existsSync(readFile)) pools = JSON.parse(await fs.readFileSync(readFile));

  let poolLps = {}
  let sums = {
      TON: BigNumber.from("0"),
      TOS: BigNumber.from("0"),
      USDC: BigNumber.from("0"),
      USDT: BigNumber.from("0"),
      WETH: BigNumber.from("0"),
  }

  const L2PROVIDER = new ethers.providers.JsonRpcProvider(process.env.CONTRACT_RPC_URL_L2 || ""); // L2 RPC URL

  const npmAbi = require("../abi/NonfungiblePositionManager.json");
  const factoryAbi = require("../abi/UniswapV3Factory.json");

  const npm = new ethers.Contract(NonfungiblePositionManager, npmAbi.abi, L2PROVIDER)
  const factory = new ethers.Contract(UniswapV3Factory, factoryAbi.abi, ethers.provider)

  let totalSupply = await npm.totalSupply()
  console.log('totalSupply', totalSupply)

  // for (let i=1 ; i <= 2; i++ ){
  for (let i=1 ;i <= totalSupply; i++ ){
    let ownerOf = await npm.ownerOf(i)
    let positions = await npm.positions(i)

    let lp = {
      tokenid: i,
      owner: ownerOf.toLowerCase(),
      positions: {
        nonce: positions.nonce.toString() ,
        operator: positions.operator,
        token0: positions.token0.toLowerCase(),
        token1: positions.token1.toLowerCase(),
        fee: positions.fee,
        tickLower: positions.tickLower,
        tickUpper: positions.tickUpper,
        liquidity: positions.liquidity.toString(),
        feeGrowthInside0LastX128: positions.feeGrowthInside0LastX128.toString(),
        feeGrowthInside1LastX128: positions.feeGrowthInside1LastX128.toString(),
        tokensOwed0: positions.tokensOwed0.toString(),
        tokensOwed1: positions.tokensOwed1.toString()
      },
      TON: "0",
      TOS: "0",
      USDC: "0",
      USDT: "0",
      WETH: "0",
    }

    let poolAddress = await factory.getPool(lp.positions.token0, lp.positions.token1, lp.positions.fee)
    poolAddress = poolAddress.toLowerCase()

    if (poolLps[poolAddress] == undefined) poolLps[poolAddress] = []

    const calcAmount = await calcLiquidity(npm, i, lp.owner, lp.positions)
    // console.log('calcAmount', calcAmount)

    let poolLp = {
      tokenid:  lp.tokenid,
      owner: lp.owner,
      token0: lp.positions.token0,
      token1: lp.positions.token1,
      amount0: calcAmount.amount0.toString(),
      amount1: calcAmount.amount1.toString(),
      TON: "0",
      TOS: "0",
      USDC: "0",
      USDT: "0",
      WETH: "0",
    }

    if (poolLp.token0 == TON.toLowerCase()) poolLp.TON = poolLp.amount0
    else if(poolLp.token0 == TOS.toLowerCase()) poolLp.TOS = poolLp.amount0
    else if(poolLp.token0 == USDC.toLowerCase()) poolLp.USDC = poolLp.amount0
    else if(poolLp.token0 == USDT.toLowerCase()) poolLp.USDT = poolLp.amount0
    else if(poolLp.token0 == WETH.toLowerCase()) poolLp.WETH = poolLp.amount0

    if (poolLp.token1 == TON.toLowerCase()) poolLp.TON = poolLp.amount1
    else if(poolLp.token1 == TOS.toLowerCase()) poolLp.TOS = poolLp.amount1
    else if(poolLp.token1 == USDC.toLowerCase()) poolLp.USDC = poolLp.amount1
    else if(poolLp.token1 == USDT.toLowerCase()) poolLp.USDT = poolLp.amount1
    else if(poolLp.token1 == WETH.toLowerCase()) poolLp.WETH = poolLp.amount1

    sums.TON = sums.TON.add(BigNumber.from(poolLp.TON))
    sums.TOS = sums.TOS.add(BigNumber.from(poolLp.TOS))
    sums.USDC = sums.USDC.add(BigNumber.from(poolLp.USDC))
    sums.USDT = sums.USDT.add(BigNumber.from(poolLp.USDT))
    sums.WETH = sums.WETH.add(BigNumber.from(poolLp.WETH))

    poolLps[poolAddress].push(poolLp)
  }

  // console.log(poolLps)

  console.log("sums", sums)

  let outFile ='./data/accounts/1.'+hre.network.name+'_contract_lp_tokens.json'
  await fs.writeFileSync(outFile, JSON.stringify(poolLps));
}

async function calcLiquidity(npm, tokenId, _owner, _position) {
    var amount0 = BigNumber.from("0")
    var amount1 = BigNumber.from("0")

    // check pool
    if (_position.liquidity != 0x00) {
      const DEAD_MAX = Math.floor(Date.now() / 1000) + 1200
      const tx1 = await npm.callStatic.decreaseLiquidity({
        tokenId: tokenId,
        liquidity: _position.liquidity,
        amount0Min: 0,
        amount1Min: 0,
        deadline: DEAD_MAX,
      })

      const tx2 = await npm.callStatic.collect({
        tokenId: tokenId,
        recipient: _owner,
        amount0Max: 2n ** 128n - 1n,
        amount1Max: 2n ** 128n - 1n,
      });
      amount0 = BigNumber.from(tx1.amount0).add(BigNumber.from(tx2.amount0));
      amount1 = BigNumber.from(tx1.amount1).add(BigNumber.from(tx2.amount1));
    }
    return {amount0, amount1}
}

async function compareLpsAndPoolsBalance() {
  let readFile ='./data/accounts/2.'+hre.network.name+'_contract_pools.json'
  var pools
  if (await fs.existsSync(readFile)) pools = JSON.parse(await fs.readFileSync(readFile));

  let sums = {
      TON: BigNumber.from("0"),
      TOS: BigNumber.from("0"),
      USDC: BigNumber.from("0"),
      USDT: BigNumber.from("0"),
      WETH: BigNumber.from("0"),
  }

  var keys = Object.keys(pools);
  for (var i=0; i<keys.length; i++) {
    var key = keys[i];
    var obj = pools[key]
     // console.log("key : " + key + ", value : " + pools[key])

    sums.TON = sums.TON.add(BigNumber.from(obj.TON))
    sums.TOS = sums.TOS.add(BigNumber.from(obj.TOS))
    sums.USDC = sums.USDC.add(BigNumber.from(obj.USDC))
    sums.USDT = sums.USDT.add(BigNumber.from(obj.USDT))
    sums.WETH = sums.WETH.add(BigNumber.from(obj.WETH))
  }

  // let poolSum = {
  //   TON: sums.TON.toString(),
  //   TOS: sums.TOS.toString(),
  //   USDC: sums.USDC.toString(),
  //   USDT: sums.USDT.toString(),
  //   WETH: sums.WETH.toString(),
  // }
  // console.log("pools.length", keys.length)
  // console.log("poolSum", poolSum)

  //=====
  var contents = ""
  contents += "==============================" +"\n"
  contents += "==== Sum of LPs by Pool ======" +"\n"
  let readFile1 ='./data/accounts/1.'+hre.network.name+'_contract_lp_tokens.json'
  var lps
  if (await fs.existsSync(readFile1)) lps = JSON.parse(await fs.readFileSync(readFile1));

  var keyPooOfLp = Object.keys(lps);
  var poolOfLp = {}

  contents += "\n"+ "pools length" +keyPooOfLp.length + "\n"
  let lpSum = {
    TON: BigNumber.from("0"),
    TOS: BigNumber.from("0"),
    USDC: BigNumber.from("0"),
    USDT: BigNumber.from("0"),
    WETH: BigNumber.from("0"),
  }
  if (keyPooOfLp.length != keys.length)
    contents += "\n"+ "Check!! The number of pools counted by LP and the number of pool contracts are different"+ "\n\n"

  for (var i=0; i < keyPooOfLp.length; i++) {
    var key = keyPooOfLp[i];
    var obj = lps[key]
     // console.log("key : " + key + ", value : " + pools[key])
    var sum = {
      TON: BigNumber.from("0"),
      TOS: BigNumber.from("0"),
      USDC: BigNumber.from("0"),
      USDT: BigNumber.from("0"),
      WETH: BigNumber.from("0")
    }
    // console.log(key, obj.length)

    for (var j=0; j<obj.length; j++) {
      sum.TON = sum.TON.add(BigNumber.from(obj[j].TON))
      sum.TOS = sum.TOS.add(BigNumber.from(obj[j].TOS))
      sum.USDC = sum.USDC.add(BigNumber.from(obj[j].USDC))
      sum.USDT = sum.USDT.add(BigNumber.from(obj[j].USDT))
      sum.WETH = sum.WETH.add(BigNumber.from(obj[j].WETH))
    }
    // console.log(key, sum)

    poolOfLp[key] = sum
    contents += "\n\n"+ i +" Pool  == "+key +" =============="+ "\n\n"
    let a = BigNumber.from(pools[key].TON)
    contents += "TON (Pool       ) :" + pools[key].TON+ "\n"
    contents += "TON (LPS of Pool) :" + poolOfLp[key].TON.toString()+ "\n"
    contents += " Diff             : "+ a.sub(poolOfLp[key].TON).toString()+ "\n"

    a = BigNumber.from(pools[key].TOS)
    contents += "TOS (Pool       ) :" + pools[key].TOS+ "\n"
    contents += "TOS (LPS of Pool) :" + poolOfLp[key].TOS.toString()+ "\n"
    contents += " Diff             : " + a.sub(poolOfLp[key].TOS).toString()+ "\n"

    a = BigNumber.from(pools[key].USDC)
    contents += "USDC (Pool       ) :" + pools[key].USDC+ "\n"
    contents += "USDC (LPS of Pool) :" + poolOfLp[key].USDC.toString()+ "\n"
    contents += " Diff             : " + a.sub(poolOfLp[key].USDC).toString()+ "\n"

    a = BigNumber.from(pools[key].USDT)
    contents += "USDT (Pool       ) :" + pools[key].USDT+ "\n"
    contents += "USDT (LPS of Pool) :" + poolOfLp[key].USDT.toString()+ "\n"
    contents += " Diff             : " + a.sub(poolOfLp[key].USDT).toString()+ "\n"

    a = BigNumber.from(pools[key].WETH)
    contents += "WETH (Pool       ) :" + pools[key].WETH+ "\n"
    contents += "WETH (LPS of Pool) :" + poolOfLp[key].WETH.toString()+ "\n"
    contents += " Diff             : " + a.sub(poolOfLp[key].WETH).toString()+ "\n"

    lpSum.TON = lpSum.TON.add(sum.TON)
    lpSum.TOS = lpSum.TOS.add(sum.TOS)
    lpSum.USDC = lpSum.USDC.add(sum.USDC)
    lpSum.USDT = lpSum.USDT.add(sum.USDT)
    lpSum.WETH = lpSum.WETH.add(sum.WETH)
  }

  let outFile1 ='./data/balances/1.'+hre.network.name+'_sum_of_lps_by_pool.txt'
  await fs.writeFileSync(outFile1, contents);

  //=====
  var contents2 = ""

  contents2 += "================================================="+"\n"
  contents2 += "===  Compare Pool Balance and Lp Total Assets ==="+ "\n"
  contents2 += "================================================="+"\n"

  contents2 += "\nTON (Pool Balance):" + sums.TON.toString()+ "\n"
  contents2 += "TON (Sum of LPS  ):" + lpSum.TON.toString()+ "\n"
  contents2 += " Diff             : " + sums.TON.sub(lpSum.TON).toString()+ "\n"+ "\n"

  contents2 += "\nTOS (Pool Balance):" + sums.TOS.toString()+ "\n"
  contents2 += "TOS (Sum of LPS  ):" + lpSum.TOS.toString()+ "\n"
  contents2 += " Diff             : " + sums.TOS.sub(lpSum.TOS).toString()+ "\n"+ "\n"

  contents2 += "\nUSDC (Pool Balance):" + sums.USDC.toString()+ "\n"
  contents2 += "USDC (Sum of LPS  ):" + lpSum.USDC.toString()+ "\n"
  contents2 += " Diff             : " + sums.USDC.sub(lpSum.USDC).toString()+ "\n"+ "\n"

  contents2 += "\nUSDT (Pool Balance):" + sums.USDT.toString()+ "\n"
  contents2 += "USDT (Sum of LPS  ):" + lpSum.USDT.toString()+ "\n"
  contents2 += " Diff             : " + sums.USDT.sub(lpSum.USDT).toString()+ "\n"+ "\n"

  contents2 += "\nWETH (Pool Balance):" + sums.WETH.toString()+ "\n"
  contents2 += "WETH (Sum of LPS  ):" + lpSum.WETH.toString()+ "\n"
  contents2 += " Diff             : " + sums.WETH.sub(lpSum.WETH).toString()+ "\n"


  //======================

  let outFile2 ='./data/balances/2.'+hre.network.name+'_compare_pool_lps.txt'
  await fs.writeFileSync(outFile2, contents2);


  return {sums, lpSum}
}

async function main() {
    // await queryAccounts()

    // 1. get transactions and accounts
    // await getAccountsUsingTransferEvent("TON", TON)
    // await getAccountsUsingTransferEvent("TOS", TOS)
    // await getAccountsUsingTransferEvent("USDC", USDC)
    // await getAccountsUsingTransferEvent("USDT", USDT)
    // await getAccountsUsingTransferEvent("WETH", WETH)
    // await getAccountsUsingTransferEvent("DOC", DOC)
    // await getAccountsUsingTransferEvent("AURA", AURA)

    // 2. divide the accounst with eoa ans contract
    // await checkContracts()

    // 3. get the balances
    // let fileMode = true
    // await getBalances ("TON", TON, pauseBlock, null, fileMode)
    // await getBalances ("TOS", TOS, pauseBlock, null, fileMode)
    // await getBalances ("USDC", USDC, pauseBlock, null, fileMode)
    // await getBalances ("USDT", USDT, pauseBlock, null, fileMode)
    // await getBalances ("WETH", WETH, pauseBlock, null, fileMode)
    // await getBalances ("DOC", DOC, pauseBlock, null, fileMode)
    // await getBalances ("AURA", AURA, pauseBlock, null, fileMode)

    // 4. Details of contracts
    // await queryContracts()

    // 5. find out the LP's token amount and owner in UniswapV3 Pool
    // file: 1.titansepolia_contract_lp_tokens.json
    // await calaculateAmountOfLps()

    // 6. look for UniswapV3Pool
    // file: 2.titansepolia_contract_pools.json
    // file: 3.titansepolia_contract_commons.json
    // await divideUniswapV3PoolContracts()

    await compareLpsAndPoolsBalance()

    // 7. gathering the EOA's balances
    // await gatheringEOA()


  }

  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });

