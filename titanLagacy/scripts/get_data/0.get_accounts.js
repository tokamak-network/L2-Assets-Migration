const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require('fs');
const axios  = require('axios');
const { BigNumber } = require("ethers")

// const {
//   toBN,
//   toWei,
//   fromWei,
//   keccak256,
//   soliditySha3,
//   solidityKeccak256,
// } = require("web3-utils");
const { BatchCrossChainMessenger, MessageStatus, OEL2ContractsLike, OEContractsLike } = require("@tokamak-network/titan-sdk")

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
const ETH = "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"

const NonfungiblePositionManager = "0x0B4695D5EB7C4e207D1b86cfFA9Eb39db56413f2"
const UniswapV3Factory = "0x31BCECA13c5be57b3677Ec116FB38fEde7Fe1217"
const L1Bridge = "0x1f032b938125f9be411801fb127785430e7b3971"
const L1TON = "0xa30fe40285b8f5c0457dbc3b7c8a280373c40044"
const L1TOS = "0xff3ef745d9878afe5934ff0b130868afddbc58e8"
const L1USDC = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
const L1USDT = "0x42d3b260c761cD5da022dB56Fe2F89c4A909b04A"
const L1DOC = "0x8c4c0fc89382f96e435527d39c9ec69dded34e77"
const L1AURA = "0xf8474c2a90b9035e0b431e1789fe76f54d4ce708"
const L1ETH = ""
const pauseBlock = 17923 //17923
const startBlock = 0


const SEPOLIA_L2_CONTRACT_ADDRESSES = {
  L2CrossDomainMessenger: '0x4200000000000000000000000000000000000007',
  L2ToL1MessagePasser: '0x4200000000000000000000000000000000000000',
  L2StandardBridge: '0x4200000000000000000000000000000000000010',
  OVM_L1BlockNumber: '0x4200000000000000000000000000000000000013',
  OVM_L2ToL1MessagePasser: '0x4200000000000000000000000000000000000000',
  OVM_DeployerWhitelist: '0x4200000000000000000000000000000000000002',
  OVM_ETH: '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000',
  OVM_GasPriceOracle: '0x420000000000000000000000000000000000000F',
  OVM_SequencerFeeVault: '0x4200000000000000000000000000000000000011',
  WETH: '0x4200000000000000000000000000000000000006',
  BedrockMessagePasser: '0x4200000000000000000000000000000000000000',
}

const SEPOLIA_CONTRACTS = {
  l1: {
    AddressManager: '0x79a53E72e9CcfAe63B0fB9A4edb66C7563d74Dc3',
    L1CrossDomainMessenger:
      '0xc123047238e8f4bFB7Ad849cA4364b721B5ABD8A',
    L1StandardBridge: '0x1F032B938125f9bE411801fb127785430E7b3971',
    StateCommitmentChain:
      '0x89b6164E9e09f023D26A9A14fcC09100C843d59a',
    CanonicalTransactionChain:
      '0xca60b60be6eeB69A390D6f906065130476F70C4d',
    BondManager: '0x6650CdF583a21a2B10aC4b7986881d4527Dd5C7F',
    OptimismPortal: '0x0000000000000000000000000000000000000000',
    L2OutputOracle: '0x0000000000000000000000000000000000000000',
  },
  l2: SEPOLIA_L2_CONTRACT_ADDRESSES,
}

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
// const L1Bridge = "0x59aa194798Ba87D26Ba6bEF80B85ec465F4bbcfD"
// const L1TON = "0x2be5e8c109e2197d077d13a82daead6a9b3433c5"
// const L1TOS = "0x409c4D8cd5d2924b9bc5509230d16a61289c8153"
// const L1USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
// const L1USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7"
// const L1ETH = ""
// const pauseBlock = 6374
// const startBlock = 0

async function getBalances(tokenSymbol, tokenAddress, blockNumber, accounts, readFileBool) {
    const networkName = hre.network.name
    const curBlock = blockNumber
    console.log("\n--- getBalances : ", tokenSymbol)

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
    var decimals = 18
    if(tokenSymbol == "USDC" || tokenSymbol == "USDT" ) decimals = 6
    console.log("sum", ethers.utils.formatUnits(sum, decimals) )
    let totalSupply = await tokenContract.totalSupply()
    console.log("totalSupply", ethers.utils.formatUnits( totalSupply, decimals))
    console.log("totalSupply.sub(sum)", ethers.utils.formatUnits(totalSupply.sub(sum), decimals) )

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


async function checkEoaInL1() {
  let eoaFile = "./data/accounts/"+hre.network.name+"_accounts_eoa.json"
  let accounts = JSON.parse(await fs.readFileSync(eoaFile));
  console.log("accounts.length", accounts.length)

  let contractsL1 = []

  const L1PROVIDER = new ethers.providers.JsonRpcProvider(process.env.CONTRACT_RPC_URL_L1 || ""); // L2 RPC URL

  for (const account of accounts) {
      let code = await L1PROVIDER.getCode(account)
      if (code != '0x')  contractsL1.push(account)
  }

  console.log('contractsL1.length', contractsL1.length)

  let eoaNotL1File = "./data/accounts/"+hre.network.name+"_accounts_eoa_not_l1.json"
  await fs.writeFileSync(eoaNotL1File, JSON.stringify(contractsL1));

  console.log(contractsL1)
  return {contractsL1}
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
  let unit = 1000
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
    // console.log('start --- ', start )
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
  let balanceETH = JSON.parse(await fs.readFileSync('data/balances/'+hre.network.name+'_ETH_'+pauseBlock+'.json'));
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
          ETH: "0",
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
        if(balanceETH[a] != "undefined" &&  balanceETH[a] != "0")  {
          contractDetails[a].ETH = balanceETH[a]
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
              if(creators[a] != undefined && creators[a]!=null){

                if (creators[a].length > 40 ) {
                  contractDetails[a].deployer = creators[a].toLowerCase()
                } else {
                  contractDetails[a].type = creators[a]
                }

              } else  {
                console.log("unknown developer of this contract", a )
                contractToDevelopers.push(a)
              }
            }
          }

          if (contractDetails[a].type != "Wrapped Ether (WETH)") {
            contractNonZero[a] = contractDetails[a]
            contractNonZeroCount++
          }

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

  // console.log("contractNonZero", contractNonZero)
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
      ETH: BigNumber.from("0"),
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
      ETH: "0",
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
      ETH: "0",
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
      ETH: BigNumber.from("0"),
  }

  var keys = Object.keys(pools);
  for (var i=0; i<keys.length; i++) {
    var key = keys[i];
    var obj = pools[key]

    sums.TON = sums.TON.add(BigNumber.from(obj.TON))
    sums.TOS = sums.TOS.add(BigNumber.from(obj.TOS))
    sums.USDC = sums.USDC.add(BigNumber.from(obj.USDC))
    sums.USDT = sums.USDT.add(BigNumber.from(obj.USDT))
    sums.WETH = sums.WETH.add(BigNumber.from(obj.WETH))
    sums.ETH = sums.ETH.add(BigNumber.from(obj.ETH))
  }

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
    ETH: BigNumber.from("0"),
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
      WETH: BigNumber.from("0"),
      ETH: BigNumber.from("0")
    }
    // console.log(key, obj.length)

    for (var j=0; j<obj.length; j++) {
      sum.TON = sum.TON.add(BigNumber.from(obj[j].TON))
      sum.TOS = sum.TOS.add(BigNumber.from(obj[j].TOS))
      sum.USDC = sum.USDC.add(BigNumber.from(obj[j].USDC))
      sum.USDT = sum.USDT.add(BigNumber.from(obj[j].USDT))
      sum.WETH = sum.WETH.add(BigNumber.from(obj[j].WETH))
      sum.ETH = sum.ETH.add(BigNumber.from(obj[j].ETH))
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

    a = BigNumber.from(pools[key].ETH)
    contents += "ETH (Pool       ) :" + pools[key].ETH+ "\n"
    contents += "ETH (LPS of Pool) :" + poolOfLp[key].ETH.toString()+ "\n"
    contents += " Diff             : " + a.sub(poolOfLp[key].ETH).toString()+ "\n"

    lpSum.TON = lpSum.TON.add(sum.TON)
    lpSum.TOS = lpSum.TOS.add(sum.TOS)
    lpSum.USDC = lpSum.USDC.add(sum.USDC)
    lpSum.USDT = lpSum.USDT.add(sum.USDT)
    lpSum.WETH = lpSum.WETH.add(sum.WETH)
    lpSum.ETH = lpSum.ETH.add(sum.ETH)
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

  contents2 += "\nETH (Pool Balance):" + sums.ETH.toString()+ "\n"
  contents2 += "ETH (Sum of LPS  ):" + lpSum.ETH.toString()+ "\n"
  contents2 += " Diff             : " + sums.ETH.sub(lpSum.ETH).toString()+ "\n"

  //======================

  let outFile2 ='./data/balances/2.'+hre.network.name+'_compare_pool_lps.txt'
  await fs.writeFileSync(outFile2, contents2);


  return {sums, lpSum}
}


async function assetsLpsbyOwner() {
  let readFile1 ='./data/accounts/1.'+hre.network.name+'_contract_lp_tokens.json'
  var lps
  if (await fs.existsSync(readFile1)) lps = JSON.parse(await fs.readFileSync(readFile1));

  var ownerAssetsOfLps = {}
  let sums = {
    TON: BigNumber.from("0"),
    TOS: BigNumber.from("0"),
    USDC: BigNumber.from("0"),
    USDT: BigNumber.from("0"),
    WETH: BigNumber.from("0"),
    ETH: BigNumber.from("0"),
  }

  var keyPooOfLp = Object.keys(lps);
  for (var i=0; i < keyPooOfLp.length; i++) {
    var key = keyPooOfLp[i];
    var obj = lps[key]

    for (var j=0; j < obj.length ; j++) {
      var a = obj[j].owner
      if (ownerAssetsOfLps[a] == undefined)
        ownerAssetsOfLps[a] = {
          TON: BigNumber.from("0"),
          TOS: BigNumber.from("0"),
          USDC: BigNumber.from("0"),
          USDT: BigNumber.from("0"),
          WETH: BigNumber.from("0"),
          ETH: BigNumber.from("0")
        }
      ownerAssetsOfLps[a].TON = ownerAssetsOfLps[a].TON.add(BigNumber.from(obj[j].TON))
      ownerAssetsOfLps[a].TOS = ownerAssetsOfLps[a].TOS.add(BigNumber.from(obj[j].TOS))
      ownerAssetsOfLps[a].USDC = ownerAssetsOfLps[a].USDC.add(BigNumber.from(obj[j].USDC))
      ownerAssetsOfLps[a].USDT = ownerAssetsOfLps[a].USDT.add(BigNumber.from(obj[j].USDT))
      ownerAssetsOfLps[a].WETH = ownerAssetsOfLps[a].WETH.add(BigNumber.from(obj[j].WETH))
      ownerAssetsOfLps[a].ETH = ownerAssetsOfLps[a].ETH.add(BigNumber.from(obj[j].ETH))
    }
  }
  // console.log('===========')
  // console.log(ownerAssetsOfLps)

  var accountAmount = {}
  var keys = Object.keys(ownerAssetsOfLps);
  for (var k=0; k < keys.length; k++) {
    var key = keys[k];
    // console.log(key)
    sums.TON = sums.TON.add(ownerAssetsOfLps[key].TON)
    sums.TOS = sums.TOS.add(ownerAssetsOfLps[key].TOS)
    sums.USDC = sums.USDC.add(ownerAssetsOfLps[key].USDC)
    sums.USDT = sums.USDT.add(ownerAssetsOfLps[key].USDT)
    sums.WETH = sums.WETH.add(ownerAssetsOfLps[key].WETH)
    sums.ETH = sums.ETH.add(ownerAssetsOfLps[key].ETH)

    accountAmount[key] = {
      TON: ownerAssetsOfLps[key].TON.toString(),
      TOS: ownerAssetsOfLps[key].TOS.toString(),
      USDC: ownerAssetsOfLps[key].USDC.toString(),
      USDT: ownerAssetsOfLps[key].USDT.toString(),
      WETH: ownerAssetsOfLps[key].WETH.toString(),
      ETH: ownerAssetsOfLps[key].ETH.toString()
    }
  }

  accountAmount["sum"] = {
    TON: sums.TON.toString(),
    TOS: sums.TOS.toString(),
    USDC: sums.USDC.toString(),
    USDT: sums.USDT.toString(),
    WETH: sums.WETH.toString(),
    ETH: sums.ETH.toString()
  }

  let outFile ='./data/balances/3.'+hre.network.name+'_asset_lps_owner.json'
  await fs.writeFileSync(outFile, JSON.stringify(accountAmount));

  return {ownerAssetsOfLps, sums}
}


async function assetsContractsbyOwner() {
  let readFile1 ='./data/accounts/3.'+hre.network.name+'_contract_commons.json'
  var contracts
  if (await fs.existsSync(readFile1)) contracts = JSON.parse(await fs.readFileSync(readFile1));

  var ownerAssetsOfContracts = {}
  let sums = {
    TON: BigNumber.from("0"),
    TOS: BigNumber.from("0"),
    USDC: BigNumber.from("0"),
    USDT: BigNumber.from("0"),
    WETH: BigNumber.from("0"),
    ETH: BigNumber.from("0"),
  }

  var keyPooOfContracts = Object.keys(contracts);
  for (var i=0; i < keyPooOfContracts.length; i++) {
    var key = keyPooOfContracts[i];
    var obj = contracts[key]

    var a = ""
    if (obj.owner != "") a = obj.owner
    else if(obj.admin != "") a = obj.admin
    else if(obj.deployer != "") a = obj.deployer

    if (a == "") {
      console.log("Error! no receiving account : ",  key)
    } else {

      if (ownerAssetsOfContracts[a] == undefined) {
        ownerAssetsOfContracts[a] = {
          TON: BigNumber.from("0"),
          TOS: BigNumber.from("0"),
          USDC: BigNumber.from("0"),
          USDT: BigNumber.from("0"),
          WETH: BigNumber.from("0"),
          ETH: BigNumber.from("0")
        }
      }
      ownerAssetsOfContracts[a].TON = ownerAssetsOfContracts[a].TON.add(BigNumber.from(obj.TON))
      ownerAssetsOfContracts[a].TOS = ownerAssetsOfContracts[a].TOS.add(BigNumber.from(obj.TOS))
      ownerAssetsOfContracts[a].USDC = ownerAssetsOfContracts[a].USDC.add(BigNumber.from(obj.USDC))
      ownerAssetsOfContracts[a].USDT = ownerAssetsOfContracts[a].USDT.add(BigNumber.from(obj.USDT))
      ownerAssetsOfContracts[a].WETH = ownerAssetsOfContracts[a].WETH.add(BigNumber.from(obj.WETH))
      ownerAssetsOfContracts[a].ETH = ownerAssetsOfContracts[a].ETH.add(BigNumber.from(obj.ETH))
    }
  }

  var accountAmount = {}
  var keys = Object.keys(ownerAssetsOfContracts);
  for (var k=0; k < keys.length; k++) {
    var key = keys[k];
    sums.TON = sums.TON.add(ownerAssetsOfContracts[key].TON)
    sums.TOS = sums.TOS.add(ownerAssetsOfContracts[key].TOS)
    sums.USDC = sums.USDC.add(ownerAssetsOfContracts[key].USDC)
    sums.USDT = sums.USDT.add(ownerAssetsOfContracts[key].USDT)
    sums.WETH = sums.WETH.add(ownerAssetsOfContracts[key].WETH)
    sums.ETH = sums.ETH.add(ownerAssetsOfContracts[key].ETH)

    accountAmount[key] = {
      TON: ownerAssetsOfContracts[key].TON.toString(),
      TOS: ownerAssetsOfContracts[key].TOS.toString(),
      USDC: ownerAssetsOfContracts[key].USDC.toString(),
      USDT: ownerAssetsOfContracts[key].USDT.toString(),
      WETH: ownerAssetsOfContracts[key].WETH.toString(),
      ETH: ownerAssetsOfContracts[key].ETH.toString()
    }
  }

  accountAmount["sum"] = {
    TON: sums.TON.toString(),
    TOS: sums.TOS.toString(),
    USDC: sums.USDC.toString(),
    USDT: sums.USDT.toString(),
    WETH: sums.WETH.toString(),
    ETH: sums.ETH.toString()
  }

  let outFile ='./data/balances/4.'+hre.network.name+'_asset_contracts_owner.json'
  await fs.writeFileSync(outFile, JSON.stringify(accountAmount));

  return {ownerAssetsOfContracts, accountAmount}
}

async function assetsAggregationByEOA() {
  let readFile1 ='./data/accounts/'+hre.network.name+'_accounts_eoa.json'
  let readFile2 ='./data/balances/3.'+hre.network.name+'_asset_lps_owner.json'
  let readFile3 ='./data/balances/4.'+hre.network.name+'_asset_contracts_owner.json'
  var accounts, lps, commonContracts
  if (await fs.existsSync(readFile1)) accounts = JSON.parse(await fs.readFileSync(readFile1));
  if (await fs.existsSync(readFile2)) lps = JSON.parse(await fs.readFileSync(readFile2));
  if (await fs.existsSync(readFile3)) commonContracts = JSON.parse(await fs.readFileSync(readFile3));

  let balanceTON = JSON.parse(await fs.readFileSync('data/balances/'+hre.network.name+'_TON_'+pauseBlock+'.json'));
  let balanceTOS = JSON.parse(await fs.readFileSync('data/balances/'+hre.network.name+'_TOS_'+pauseBlock+'.json'));
  let balanceUSDC = JSON.parse(await fs.readFileSync('data/balances/'+hre.network.name+'_USDC_'+pauseBlock+'.json'));
  let balanceUSDT = JSON.parse(await fs.readFileSync('data/balances/'+hre.network.name+'_USDT_'+pauseBlock+'.json'));
  let balanceWETH = JSON.parse(await fs.readFileSync('data/balances/'+hre.network.name+'_WETH_'+pauseBlock+'.json'));
  let balanceETH = JSON.parse(await fs.readFileSync('data/balances/'+hre.network.name+'_ETH_'+pauseBlock+'.json'));

  let sums = {
    TON: BigNumber.from("0"),
    TOS: BigNumber.from("0"),
    USDC: BigNumber.from("0"),
    USDT: BigNumber.from("0"),
    WETH: BigNumber.from("0"),
    ETH: BigNumber.from("0"),
    TETH: BigNumber.from("0"),
  }

  var assetAggregation = {}
  var len = accounts.length

  for (var i = 0; i< len; i++) {
    var account = accounts[i]
    var balances = {
      TON: balanceTON[account]!=undefined? balanceTON[account]: "0",
      TOS: balanceTOS[account]!=undefined? balanceTOS[account]: "0",
      USDC: balanceUSDC[account]!=undefined? balanceUSDC[account]: "0",
      USDT: balanceUSDT[account]!=undefined? balanceUSDT[account]: "0",
      WETH: balanceWETH[account]!=undefined? balanceWETH[account]: "0",
      ETH: balanceETH[account]!=undefined? balanceETH[account]: "0"
    }

    var uniswap = {
      TON: lps[account]!=undefined? lps[account].TON: "0",
      TOS: lps[account]!=undefined? lps[account].TOS: "0",
      USDC: lps[account]!=undefined? lps[account].USDC: "0",
      USDT: lps[account]!=undefined? lps[account].USDT: "0",
      WETH: lps[account]!=undefined? lps[account].WETH: "0",
      ETH: lps[account]!=undefined? lps[account].ETH: "0",
    }
    var contract = {
      TON: commonContracts[account]!=undefined? commonContracts[account].TON: "0",
      TOS: commonContracts[account]!=undefined? commonContracts[account].TOS: "0",
      USDC: commonContracts[account]!=undefined? commonContracts[account].USDC: "0",
      USDT: commonContracts[account]!=undefined? commonContracts[account].USDT: "0",
      WETH: commonContracts[account]!=undefined? commonContracts[account].WETH: "0",
      ETH: commonContracts[account]!=undefined? commonContracts[account].ETH: "0",
    }
    assetAggregation[account] = {
      total : {
        TON: BigNumber.from(balances.TON).add(BigNumber.from(uniswap.TON)).add(BigNumber.from(contract.TON)).toString(),
        TOS: BigNumber.from(balances.TOS).add(BigNumber.from(uniswap.TOS)).add(BigNumber.from(contract.TOS)).toString(),
        USDC: BigNumber.from(balances.USDC).add(BigNumber.from(uniswap.USDC)).add(BigNumber.from(contract.USDC)).toString(),
        USDT: BigNumber.from(balances.USDT).add(BigNumber.from(uniswap.USDT)).add(BigNumber.from(contract.USDT)).toString(),
        WETH: BigNumber.from(balances.WETH).add(BigNumber.from(uniswap.WETH)).add(BigNumber.from(contract.WETH)).toString(),
        ETH: BigNumber.from(balances.ETH).add(BigNumber.from(uniswap.ETH)).add(BigNumber.from(contract.ETH)).toString(),
        TETH: BigNumber.from("0"),
      },
      balances: balances,
      uniswap: uniswap,
      contract: contract
    }
    assetAggregation[account].total.TETH = BigNumber.from(assetAggregation[account].total.WETH).add(BigNumber.from(assetAggregation[account].total.ETH)).toString()

    sums.TON = sums.TON.add(BigNumber.from(assetAggregation[account].total.TON))
    sums.TOS = sums.TOS.add(BigNumber.from(assetAggregation[account].total.TOS))
    sums.USDC = sums.USDC.add(BigNumber.from(assetAggregation[account].total.USDC))
    sums.USDT = sums.USDT.add(BigNumber.from(assetAggregation[account].total.USDT))
    sums.WETH = sums.WETH.add(BigNumber.from(assetAggregation[account].total.WETH))
    sums.ETH = sums.ETH.add(BigNumber.from(assetAggregation[account].total.ETH))
  }
  sums.TETH =  sums.WETH.add(sums.ETH)

  console.log("\n ---- assetsAggregationByEOA: SUM ---- \n"  )
  console.log("TON", ethers.utils.formatUnits(sums.TON, 18) )
  console.log("TOS", ethers.utils.formatUnits(sums.TOS, 18) )
  console.log("USDC", ethers.utils.formatUnits(sums.USDC, 6) )
  console.log("USDT", ethers.utils.formatUnits(sums.USDT, 6) )
  console.log("WETH", ethers.utils.formatUnits(sums.WETH, 18) )
  console.log("ETH", ethers.utils.formatUnits(sums.ETH, 18) )
  console.log("TETH", ethers.utils.formatUnits(sums.TETH, 18) )


  let outFile ='./data/balances/5.'+hre.network.name+'_asset_eoa.json'
  await fs.writeFileSync(outFile, JSON.stringify(assetAggregation));

  let totalEoaAmount = {
    TON: sums.TON.toString(),
    TOS: sums.TOS.toString(),
    USDC: sums.USDC.toString(),
    USDT: sums.USDT.toString(),
    WETH: sums.WETH.toString(),
    ETH: sums.ETH.toString(),
    TETH: sums.TETH.toString()
  }
  let outFile1 ='./data/balances/7.'+hre.network.name+'_total_eoa_asset.json'
  await fs.writeFileSync(outFile1, JSON.stringify(totalEoaAmount));

  return {balances, uniswap, contract, assetAggregation, sums, totalEoaAmount}

}

async function getBalanceL1Bridge() {

  const L1PROVIDER = new ethers.providers.JsonRpcProvider(process.env.CONTRACT_RPC_URL_L1 || ""); // L2 RPC URL

  const tosAbi = require("../abi/TOS.json");
  const bridgeAbi = require("../abi/L1StandardBridge.json");

  const L1TonContract = new ethers.Contract(L1TON, tosAbi.abi, L1PROVIDER)
  const L1TosContract = new ethers.Contract(L1TOS, tosAbi.abi, L1PROVIDER)
  const L1UsdcContract = new ethers.Contract(L1USDC, tosAbi.abi, L1PROVIDER)
  const L1UsdtContract = new ethers.Contract(L1USDT, tosAbi.abi, L1PROVIDER)
  const bridge = new ethers.Contract(L1Bridge, bridgeAbi.abi, L1PROVIDER)

  let balanceOfL1Bridge = {
      TON: BigNumber.from("0"),
      TOS: BigNumber.from("0"),
      USDC: BigNumber.from("0"),
      USDT: BigNumber.from("0"),
      ETH: BigNumber.from("0"),
  }

  balanceOfL1Bridge.TON = await L1TonContract.balanceOf(L1Bridge)
  balanceOfL1Bridge.TOS = await L1TosContract.balanceOf(L1Bridge)
  balanceOfL1Bridge.USDC = await L1UsdcContract.balanceOf(L1Bridge)
  balanceOfL1Bridge.USDT = await L1UsdtContract.balanceOf(L1Bridge)
  balanceOfL1Bridge.ETH = await ethers.provider.getBalance(L1Bridge)

  console.log('\n==================================')
  console.log('=== Balance Of L1 Bridge ==========')

  console.log('\nTON', ethers.utils.formatUnits(balanceOfL1Bridge.TON, 18))
  console.log('TOS', ethers.utils.formatUnits(balanceOfL1Bridge.TOS, 18))
  console.log('USDC', ethers.utils.formatUnits(balanceOfL1Bridge.USDC, 6))
  console.log('USDT', ethers.utils.formatUnits(balanceOfL1Bridge.USDT, 6))
  console.log('ETH', ethers.utils.formatUnits(balanceOfL1Bridge.ETH, 18))
  console.log(' ')

  let depositsOfL1Bridge = {
    TON: BigNumber.from("0"),
    TOS: BigNumber.from("0"),
    USDC: BigNumber.from("0"),
    USDT: BigNumber.from("0"),
    ETH: BigNumber.from("0"),
  }

  depositsOfL1Bridge.TON = await bridge.deposits(L1TON, TON)
  depositsOfL1Bridge.TOS = await bridge.deposits(L1TOS, TOS)
  depositsOfL1Bridge.USDC = await bridge.deposits(L1USDC, USDC)
  depositsOfL1Bridge.USDT = await bridge.deposits(L1USDT, USDT)

  console.log('\n==================================')
  console.log('=== deposits Of L1 Bridge ==========')

  console.log('\nTON', ethers.utils.formatUnits(depositsOfL1Bridge.TON, 18))
  console.log('TOS', ethers.utils.formatUnits(depositsOfL1Bridge.TOS, 18))
  console.log('USDC', ethers.utils.formatUnits(depositsOfL1Bridge.USDC, 6))
  console.log('USDT', ethers.utils.formatUnits(depositsOfL1Bridge.USDT, 6))
  console.log(' ')


  return { balanceOfL1Bridge, depositsOfL1Bridge }

}

async function getPendingWithdrawals() {

  let readFile2 ='./data/transactions/'+hre.network.name+"_l2_send_message_data_"+pauseBlock+".json"
  var events
  if (await fs.existsSync(readFile2)) events = JSON.parse(await fs.readFileSync(readFile2));

  var resultSuccessfulMessages = {}
  var pendingSuccessfulMessages = {}

  const L1CrossDomainMessengerAbi = require("../abi/L1CrossDomainMessenger.json");
  const L2CrossDomainMessengerAbi = require("../abi/L2CrossDomainMessenger.json");

  const l2Provider = new ethers.providers.JsonRpcProvider(process.env.CONTRACT_RPC_URL_L2);
  const l1Provider = new ethers.providers.JsonRpcProvider(process.env.CONTRACT_RPC_URL_L1);

  const crossDomainMessengerL1 = new ethers.Contract(SEPOLIA_CONTRACTS.l1.L1CrossDomainMessenger, L1CrossDomainMessengerAbi.abi, l1Provider);

  let ifaceCrossDomainMessengerL2 = new ethers.utils.Interface(L2CrossDomainMessengerAbi.abi);

  var keyHash = Object.keys(events);

  for (var i=0; i < keyHash.length; i++) {

      var key = keyHash[i]
      var obj = events[key]

      var xDomainCalldata = ifaceCrossDomainMessengerL2.encodeFunctionData(
        "relayMessage",
        [
          obj.target,
          obj.sender,
          obj.message,
          BigNumber.from(obj.messageNonce)
        ]
      )

      var xDomainCalldataHash = ethers.utils.keccak256(xDomainCalldata);
      let successfulMessages = await crossDomainMessengerL1.successfulMessages(xDomainCalldataHash)
      let failedMessages = false

      if(!successfulMessages) failedMessages = await crossDomainMessengerL1.failedMessages(xDomainCalldataHash)

        resultSuccessfulMessages[key] = {
        target: obj.target,
        sender: obj.sender,
        message: obj.message,
        messageNonce: obj.messageNonce,
        xDomainCalldata: xDomainCalldata,
        xDomainCalldataHash: xDomainCalldataHash,
        decode: decodeMessage(obj.message, obj.target),
        successfulMessages: successfulMessages,
        failedMessages: failedMessages
      }

      if(!successfulMessages && !failedMessages) {
        pendingSuccessfulMessages[key] = resultSuccessfulMessages[key]
        // console.log(key, falseSuccessfulMessages[key])
      }
      // console.log(i, key, resultSuccessfulMessages[key])
  }

  let outFile1 ='./data/withdrawals/1.'+hre.network.name+'_l1_cross_check_relayMessage_all.json'
  await fs.writeFileSync(outFile1, JSON.stringify(resultSuccessfulMessages));

  let outFile2 ='./data/withdrawals/2.'+hre.network.name+'_l1_cross_pending_relayMessage.json'
  await fs.writeFileSync(outFile2, JSON.stringify(pendingSuccessfulMessages));

  return {pendingSuccessfulMessages, resultSuccessfulMessages}

}

async function getSendMessageTxs(contractAddress) {

  const networkName = hre.network.name
  let block = await ethers.provider.getBlock('latest');
  let start = 0;
  // let end = block.number;
  let end = pauseBlock
  console.log('end', end)
  let blockNumber = pauseBlock
  const abi = [ "event SentMessage(address indexed target, address sender, bytes message, uint256 messageNonce, uint256 gasLimit)" ];
  const iface = new ethers.utils.Interface(abi);
  const functionId = ethers.utils.id("SentMessage(address,address,bytes,uint256,uint256)")

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
      address: contractAddress,
      fromBlock: start,
      toBlock: toBlock,
      topics: [functionId]
    };
    // console.log('filter', filter )

    const txs = await ethers.provider.getLogs(filter);

    for (const tx of txs) {
      const { transactionHash } = tx;
      // console.log('transactionHash', transactionHash )
      transactions.push(transactionHash)
    }
    start = toBlock;
    // console.log('start --- ', start )
  }

  let outFile = "./data/transactions/"+networkName+"_l2_send_message_"+blockNumber+".json"
  await fs.writeFileSync(outFile, JSON.stringify(transactions));

  //===========
  let sendMessageData = {}
  let i = 0
  if (transactions.length > 0) {
    for (const sendTx of transactions) {
      const { logs } = await ethers.provider.getTransactionReceipt(sendTx);
      const foundLog = logs.find(el => el && el.topics && el.topics.includes(functionId));
      if (!foundLog) continue;
      const parsedlog = iface.parseLog(foundLog);
      const {target, sender, message, messageNonce, gasLimit} = parsedlog["args"];
      sendMessageData[sendTx] = {
        target: target,
        sender: sender,
        message: message,
        messageNonce: messageNonce.toString(),
        gasLimit: gasLimit.toString()
      }
      i++
      if(i % 200 == 0) {
        // console.log('i --- ', i )
      }
    }
  }

  let outFile1 = "./data/transactions/"+networkName+"_l2_send_message_data_"+blockNumber+".json"
  await fs.writeFileSync(outFile1, JSON.stringify(sendMessageData));

  return { transactions, sendMessageData};
}

const addHexPrefix = (privateKey) => {
  if (privateKey.substring(0, 2) !== "0x") {
    privateKey = "0x" + privateKey
  }
  return privateKey
}

const decodeMessage = (message, target) => {

  const L1StandardBridgeAbi = require("../abi/L1StandardBridge.json")
  let ifaceL1StandardBridge = new ethers.utils.Interface(L1StandardBridgeAbi.abi);
  const finalizeETHWithdrawalId = ethers.utils.id("finalizeETHWithdrawal(address,address,uint256,bytes)").substring(0, 10).toLowerCase()
  const finalizeERC20WithdrawalId = ethers.utils.id("finalizeERC20Withdrawal(address,address,address,address,uint256,bytes)").substring(0, 10).toLowerCase()

  let details = {
    targetContract : '',
    functionName: '',
    decodedArgs: ''
  }

  if (target.toLowerCase() == SEPOLIA_CONTRACTS.l1.L1StandardBridge.toLowerCase()){
    details.targetContract = 'L1StandardBridge'
    let decodedArgs = ifaceL1StandardBridge.decodeFunctionData(message.slice(0,10), message)

    if (message.substring(0, 10).toLowerCase() == finalizeETHWithdrawalId) {
       details.functionName = 'finalizeETHWithdrawal'
       details.decodedArgs = {
        _from: decodedArgs._from,
        _to: decodedArgs._to,
        _amount: decodedArgs._amount.toString(),
        _data: decodedArgs._data
       }
    } else if(message.substring(0, 10).toLowerCase() == finalizeERC20WithdrawalId) {
      details.functionName = 'finalizeERC20Withdrawal'
      details.decodedArgs = {
        _l1Token: decodedArgs._l1Token,
        _l2Token: decodedArgs._l2Token,
        _from: decodedArgs._from,
        _to: decodedArgs._to,
        _amount: decodedArgs._amount.toString(),
        _data: decodedArgs._data
       }

    } else {
      details.decodedArgs = decodedArgs
    }
  }
  return details
}

async function totalPendingAsset() {

  let readFile1 ='./data/withdrawals/2.'+hre.network.name+"_l1_cross_pending_relayMessage.json"
  var pendingTransactions
  if (await fs.existsSync(readFile1)) pendingTransactions = JSON.parse(await fs.readFileSync(readFile1));

  var sums ={
    TON: BigNumber.from("0"),
    TOS: BigNumber.from("0"),
    USDC: BigNumber.from("0"),
    USDT: BigNumber.from("0"),
    ETH: BigNumber.from("0"),
  }
  var keyHash = Object.keys(pendingTransactions);
  var L1_TON = L1TON.toLowerCase()
  var L1_TOS = L1TOS.toLowerCase()
  var L1_USDC = L1USDC.toLowerCase()
  var L1_USDT = L1USDT.toLowerCase()

  for (var i=0; i < keyHash.length; i++) {

      var key = keyHash[i]
      var obj = pendingTransactions[key]

      if (obj != undefined && obj.decode != undefined) {
        var deposit = obj.decode
        if (deposit.targetContract == "L1StandardBridge") {
          if (deposit.functionName == "finalizeETHWithdrawal") {
            sums.ETH = sums.ETH.add(BigNumber.from(deposit.decodedArgs._amount))

          } else if(deposit.functionName == "finalizeERC20Withdrawal") {

            let _l1Token = deposit.decodedArgs._l1Token.toLowerCase()
            switch(_l1Token) {
              case L1_TON:
                sums.TON = sums.TON.add(BigNumber.from(deposit.decodedArgs._amount))
                break;
              case L1_TOS:
                sums.TOS = sums.TOS.add(BigNumber.from(deposit.decodedArgs._amount))
                break;
              case L1_USDC:
                sums.USDC = sums.USDC.add(BigNumber.from(deposit.decodedArgs._amount))
                break;
              case L1_USDT:
                sums.USDT = sums.USDT.add(BigNumber.from(deposit.decodedArgs._amount))
                break;
              default:
                console.log("Unknown Asset ", _l1Token)
            }
          }
        }
      }
    }

    console.log("\n ---- totalPendingAsset  ---- \n"  )
    console.log("TON", ethers.utils.formatUnits(sums.TON, 18) )
    console.log("TOS", ethers.utils.formatUnits(sums.TOS, 18) )
    console.log("USDC", ethers.utils.formatUnits(sums.USDC, 6) )
    console.log("USDT", ethers.utils.formatUnits(sums.USDT, 6) )
    console.log("ETH", ethers.utils.formatUnits(sums.ETH, 18) )

    let totalPendingAmount = {
      TON: sums.TON.toString(),
      TOS: sums.TOS.toString(),
      USDC: sums.USDC.toString(),
      USDT: sums.USDT.toString(),
      ETH: sums.ETH.toString()
    }

    let outFile ='./data/balances/6.'+hre.network.name+'_total_pending_asset.json'
    await fs.writeFileSync(outFile, JSON.stringify(totalPendingAmount));

    return totalPendingAmount
}

async function verifyAssetAmount() {

  let readFile1 ='./data/balances/6.'+hre.network.name+"_total_pending_asset.json"
  var pendingAmounts
  if (await fs.existsSync(readFile1)) pendingAmounts = JSON.parse(await fs.readFileSync(readFile1));

  let readFile2 ='./data/balances/6.'+hre.network.name+"_total_pending_asset.json"
  var eoaAmount
  if (await fs.existsSync(readFile2)) eoaAmount = JSON.parse(await fs.readFileSync(readFile2));


  let readFile3 ='./data/balances/6.'+hre.network.name+"_total_pending_asset.json"
  var bridgeAmount
  if (await fs.existsSync(readFile3)) bridgeAmount = JSON.parse(await fs.readFileSync(readFile3));

}

async function main() {

    console.log("\n1. ---- queryAccounts ----------------------")
    // await queryAccounts()


    console.log("\n2. ---- get transactions and accounts ----------------------")
    // await getAccountsUsingTransferEvent("TON", TON)
    // await getAccountsUsingTransferEvent("TOS", TOS)
    // await getAccountsUsingTransferEvent("USDC", USDC)
    // await getAccountsUsingTransferEvent("USDT", USDT)
    // await getAccountsUsingTransferEvent("WETH", WETH)
    // await getAccountsUsingTransferEvent("DOC", DOC)
    // await getAccountsUsingTransferEvent("AURA", AURA)

    console.log("\n3. ---- divide the accounst with eoa ans contract ----------------------")

    // await checkContracts()
    // await checkEoaInL1()


    console.log("\n4. ----  get the balances ----------------------")
    // let fileMode = true
    // await getBalances ("ETH", ETH, pauseBlock, null, fileMode)
    // await getBalances ("TON", TON, pauseBlock, null, fileMode)
    // await getBalances ("TOS", TOS, pauseBlock, null, fileMode)
    // await getBalances ("USDC", USDC, pauseBlock, null, fileMode)
    // await getBalances ("USDT", USDT, pauseBlock, null, fileMode)
    // await getBalances ("WETH", WETH, pauseBlock, null, fileMode)
    // await getBalances ("DOC", DOC, pauseBlock, null, fileMode)
    // await getBalances ("AURA", AURA, pauseBlock, null, fileMode)

    console.log("\n5. ----  Details of contracts ----------------------")
    await queryContracts()


    console.log("\n6. ----  find out the LP's token amount and owner in UniswapV3 Pool --")
    // file: 1.titansepolia_contract_lp_tokens.json
    await calaculateAmountOfLps()

    console.log("\n7. ----  look for UniswapV3Pool --")
    // file: 2.titansepolia_contract_pools.json
    // file: 3.titansepolia_contract_commons.json
    await divideUniswapV3PoolContracts()

    console.log("\n8. ---- compareLpsAndPoolsBalance  --")
    // file: /balances/1.titansepolia_sum_of_lps_by_pool.txt
    // file: /balances/2.titansepolia_compare_pool_lps.txt
    await compareLpsAndPoolsBalance()

    console.log("\n9. ---- assetsLpsbyOwner  --")
    // file: /balances/3.titansepolia_asset_lps_owner.json
    await assetsLpsbyOwner()


    console.log("\n10. ---- assetsContractsbyOwner  --")
    // file: /balances/4.titansepolia_asset_contracts_owner.json
    await assetsContractsbyOwner()

    // file: /balances/4.titansepolia_assets_eoa.json
    await assetsAggregationByEOA()

    console.log("\n11. ---- getBalanceL1Bridge  --")
    // file: /balances/5.titansepolia_balance_l1_bridge.json
    await getBalanceL1Bridge()

    console.log("\n12. ---- Pending Withdrawals  --")

    //====== Pending Withdrawals
    // file: /transactions/titansepolia_l2_send_message_17923.json
    // file: /transactions/titansepolia_l2_send_message_data_17923.json
    await getSendMessageTxs(SEPOLIA_L2_CONTRACT_ADDRESSES.L2CrossDomainMessenger)

    // file: /withdrawals/1.titansepolia_l1_cross_check_relayMessage_all.json
    // file: /withdrawals/2.titansepolia_l1_cross_pending_relayMessage.json
    await getPendingWithdrawals()

    // file: /data/balances/6.titansepolia_total_pending_asset.json
    await totalPendingAsset()

    console.log("\n13. ---- Verify  --")
    // await verifyAssetAmount()

  }

  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });

