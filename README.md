# L2-Assets-Migration

When Legacy Titan Closes, L2 assets can be withdrawn from L1.

## Environment Variables

The following environment variables are required to be set. See the .env file for more information on specifying block numbers and using the Subgraph API.

`CONTRACT_RPC_URL_L1` 

`CONTRACT_RPC_URL_L2` 

`CONTRACTS_L2BRIDGE_ADDRESS`

`CONTRACTS_L1BRIDGE_ADDRESS`

`CONTRACTS_NONFUNGIBLE_ADDRESS`

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
    yarn gensub
    yarn hardhat run scripts/gen-force-migration-assets.sub.ts
```
The following files are where L2 assets are collected and "generated 
generate-assets1.json, generate-assets2.json, generate-assets3.json"

- generate-assets1.json : v3 Pool assets are not being collected. 

- generate-assets2.json : v3 Pool assets have been collected.

- generate-assets3.json : Used to configure the service using the collected assets.  The main uses are Front, Contract. 



## Generated Assets Demo
See the image in the repo


