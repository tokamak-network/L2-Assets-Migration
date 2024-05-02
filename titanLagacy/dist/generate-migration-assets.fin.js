"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const hardhat_1 = __importDefault(require("hardhat"));
const types_1 = require("./types");
const { ethers } = hardhat_1.default;
/*
// Before collecting a collection, you need to do some preliminary work.
// 1. Forking target : L2 RpcUrl
// 2. Env set : L1rpc, L2rpc, L1bridgeAddress, L2bridgeAddress
// 3. command Arg : startblock(optinal), endblock
*/
const getArgs = () => {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        console.log('Accepts only two arguments.');
        process.exit(1);
    }
    const st = parseFloat(args[0]);
    const end = parseFloat(args[1]);
    if (isNaN(st) || isNaN(end)) {
        console.log("Arguments support numbers only.");
        process.exit(1);
    }
    return [st, end];
};
// const [STBLOCK, ENDBLOCK] = getArgs()
// let out:Closed; // export assets data
const outPool = []; // export assets data
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const L1PROVIDER = new ethers.providers.JsonRpcProvider(process.env.CONTRACTS_RPC_URL || ""); // L2 RPC URL
const L2PROVIDER = new ethers.providers.JsonRpcProvider(process.env.CONTRACT_RPC_URL_L1 || ""); // L1 RPC URL
const L1BRIDGE = process.env.CONTRACTS_L1BRIDGE_ADDRESS || ""; // L1 bridge address
const L2BRIDGE = process.env.CONTRACTS_L2BRIDGE_ADDRESS || ""; // L2 bridge address
const runChecker = async () => {
    console.log(L1PROVIDER);
    // console.log("Start Block : ", STBLOCK, "End Block : ", ENDBLOCK)
};
// yarn hardhat run --network hardhat generate-migration-assets-fin 12 123
const main = async () => {
    // await hre.run('node');
    const nonFungibleContract = await ethers.getContractAt(types_1.NonfungibleTokenPositionManager, "0xfAFc55Bcdc6e7a74C21DD51531D14e5DD9f29613"); // env config option
    // getArgs();
    await runChecker();
};
exports.main = main;
(0, exports.main)().catch((error) => {
    console.log(error);
    process.exit(1);
});
