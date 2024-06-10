# L2-ForceWithdraw

This project is a protocol for transmitting floating ERC20 and NativeToken to L1 users when the L2 network is terminated. The project supports upgrades to the asset collection protocol and L1 standard bridge contract.

To collect assets and upgrade the L1 Standard Bridge, you must accurately enter the required environment variables below.


### Force Withdraw Protocol Process
#### Below we include policies and considerations for ForceWithdraw.

1.  L1 Bridge partial feature shutdown: (Deposit related)
- Through bridge contract upgrade
2. L2 network shutdown, the ability to collect some assets should be open.
-  Users can't create transactions.
-  Administrators need to read some API and block information needed to collect assets.
-  scanner [api](https://www.notion.so/Fin-Assets-Collection-Script-Explain-d61fdca092184f059de9102aa162c815?pvs=21)
        - v3 pool subgraph
3. After starting the forced withdrawal protocol, there was a **one-week waiting** period to collect accurate assets.
4. The foundation transmits aggregated assets to users through automated scripts.

### How to use each step
explain based on Titan. (Be sure to initialize and use the project)
1. When the network shuts down (some functions must remain alive. Withdrawal request transactions in L2 must be accessible).


```bash
# Upgrade L1 StandardBridge using the above command.
cd titanLagacy
yarn upgrade
```

2. Collect assets by specifying specific blocks. (default is 0 ~ latest)
```bash
yarn gen
```

3. After internal data verification is complete, start the ForceWithdraw Protocol. (An automated script verifies most of the data.)

```bash
# If there is no parameter, the default value is 0.
yarn hardhat send --max 20 --network main
```

After “send” is completed, transmission success or failure is distinguished. Afterwards, when calling send, failed items are automatically filtered out and only the failed list is retransmitted.
(data/generate-completed.json contains successful hashes.)
```bash
Total Count:  636 // Total number of transfers (including amount 0)
Request Count:  418 // Number of calls issued (excluding 0)
Completed Event Count:  409 // successful request
Failed Count:  9 // failed request
```

## Environment Variables

The following environment variables are required to be set. See the .env file for more information on specifying block numbers and using the Subgraph API!

`CONTRACT_RPC_URL_L1` : L1 RPC URL

`CONTRACT_RPC_URL_L2` : L2 RPC URL

`CONTRACTS_L2BRIDGE_ADDRESS` : Address of the L2 Standard Bridge Contract (Proxy Address)

`CONTRACTS_L1BRIDGE_ADDRESS` : Address of the L1 Standard Bridge Contract (Proxy Address)

`CONTRACTS_NONFUNGIBLE_ADDRESS` : Address of the Non-Fungible Token (NFT) contract.

`L1_PORXY_OWNER` :  This is the private key, the contract owner of L1 Standard Bridge. This is the wallet address where you can upgrade your contract based on Titan.

`L1_FORCE_OWNER` : This is the private key of "closer" when upgrading the L1 standard bridge contract "UpgradeL1Bridge.sol".

`L1_RPC_URL_SDK` : This is the SDK URL. It must be a full node RPC address.

## (Optional) Environment Variables
`L1_START_BLOCK` : START_BLOCk, Default value 0

`L1_END_BLOCK` : END_BLOCK, Default value latest

`L2_START_BLOCK` : START_BLOCk, Default value 0

`L2_END_BLOCK` : END_BLOCK, Default value latest


## Installation

Install this project with yarn or npm

```bash
    cd titanlagacy
    yarn install 
```
SubModule Installation
```bash
    git submodule init
    git submodule update
```

## Running Tests  
Registry Assets Collection into a contract and run unit tests on the upgraded functionality

```bash 
   yarn hardhat test test/upgrade/forcewithdraw.ts
```
    
## How to use L2 Assets collection

The first is to rely on On-Chain functionality.

The second is to use SubGraph queries to improve speed by reducing the number of loop lookups.

Here's how to use On-Chain
```bash
    yarn gen
    yarn hardaht run scripts/gen-force-migration-assets.ts
```

To query using graph queries, you can do the following 
```bash
    yarn gen
    yarn hardhat run scripts/gen-force-migration-assets.sub.ts
```
The following files are where L2 assets are collected and "generated 
generate-assets1.json, generate-assets2.json, generate-assets3.json"

`generate-assets1.json`: v3 Pool assets are not being collected. 
```bash
{
 "L1startBlock": 0,
 "L1endBlock": 19973387,
 "L2startBlock": 0,
 "L2endBlock": 19973387,
 "data": [
  {
   "l1Token": "0x0000000000000000000000000000000000000000",
   "l2Token": "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000",
   "tokenName": "Ether",
   "data": [
    {
     "claimer": "0x4c90e5723fe4de59d0895cafb749fd8756d7ce19",
     "amount": "1000000000000000",
     "type": 0
    },
    {
     "claimer": "0xc4de383f501b301ef2379e14779b267510808c03",
     "amount": "8899999999944818",
     "type": 0
    },
    ...
```

`generate-assets2.json`: v3 Pool assets have been collected.
```bash
[
 {
  "l1Token": "0x0000000000000000000000000000000000000000",
  "l2Token": "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000",
  "tokenName": "Ether",
  "data": [
   {
    "claimer": "0x4c90e5723fe4de59d0895cafb749fd8756d7ce19",
    "amount": "1000000000000000",
    "hash": "0x954b627a3af77cbde166018a1b3937d5b90e3c00ee2b8957625b45d4ef57b8dc"
   },
   {
    "claimer": "0xc4de383f501b301ef2379e14779b267510808c03",
    "amount": "8899999999944818",
    "hash": "0xc01bc2369557a5eaf3a32d34365391f557eedc8fc72d4fdd5b312332f16f5311"
   },
   {
    "claimer": "0xf1a214a2fadd7ca7d0b1558f402d3de1ce014ecf",
    "amount": "100000000000000",
    "hash": "0x00c514433441fe1b3d29f88377870e84b6d3595fcb9c5820e9be8fc9fa191652"
   },
   ...
```

`generate-assets3.json`: Used to configure the service using the collected assets.  The main uses are Front, Contract. 
```bash
[
 {
  "l1Token": "0x0000000000000000000000000000000000000000",
  "l2Token": "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000",
  "tokenName": "Ether",
  "data": [
   {
    "claimer": "0x4c90e5723fe4de59d0895cafb749fd8756d7ce19",
    "amount": "1000000000000000",
    "hash": "0x954b627a3af77cbde166018a1b3937d5b90e3c00ee2b8957625b45d4ef57b8dc"
   },
   {
    "claimer": "0xc4de383f501b301ef2379e14779b267510808c03",
    "amount": "8899999999944818",
    "hash": "0xc01bc2369557a5eaf3a32d34365391f557eedc8fc72d4fdd5b312332f16f5311"
   },
   {
    "claimer": "0xf1a214a2fadd7ca7d0b1558f402d3de1ce014ecf",
    "amount": "100000000000000",
    "hash": "0x00c514433441fe1b3d29f88377870e84b6d3595fcb9c5820e9be8fc9fa191652"
   },
   ...

```

`generate-WithdrawalClaim.json`: When starting the protocol, you have no choice but to rely on the L2 SDK for the list of withdrawal requests already made. This collects a list of currently withdrawn requests.
```bash
[
 {
  "txHash": "0x4089e75924f3880788d5bc57a9f51e36b0a98bf6f7f68943f8674178eeb47c70",
  "event": {
   "l1Token": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
   "l2Token": "0x46BbbC5f20093cB53952127c84F1Fbc9503bD6D9",
   "from": "0xcb002fC8Cb3a5638F19156B16F98e9eC9232c1ae",
   "to": "0xcb002fC8Cb3a5638F19156B16F98e9eC9232c1ae",
   "amount": {
    "type": "BigNumber",
    "hex": "0x4c4b40"
   },
   "data": "0x"
  },
  "state": 4,
  "isClaimed": false
 },
 {
  "txHash": "0xc3cefa72c84ae8faf021dfa3b9d754478244fadd25cfc45b555a607cfee0237a",
  "event": {
   "l1Token": "0x0000000000000000000000000000000000000000",
   "l2Token": "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000",
   "from": "0x22D1B7A30121aEee04122f0E367D3864892ee0D8",
   "to": "0x22D1B7A30121aEee04122f0E367D3864892ee0D8",
   "amount": {
    "type": "BigNumber",
    "hex": "0x1f161421c8e000"
   },
   "data": "0x"
  },
  "state": 4,
  "isClaimed": false
 },
 ...
```


## Generated Assets Collection Report
!["test"](https://github.com/tokamak-network/L2-Assets-Migration/blob/dev/gernated_example.png)


