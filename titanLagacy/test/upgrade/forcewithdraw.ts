import { expect } from "chai";
import { BaseContract } from "ethers";
import { ethers } from "hardhat";


export default describe('# Unit Test : L1 StandardBridge', () => {
    const L2BRIDGE = process.env.CONTRACTS_L2BRIDGE_ADDRESS || ""; // L2 bridge address
    const proxyABI = require("../../artifacts/contracts/Proxy.sol/Proxy.json");
    const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");
    const zeroAddress = ethers.ZeroAddress


    it('', async () => {
        describe('', () => {

            it('L1 Bridge Upgrading', async () => {
                const [deployers] = await ethers.getSigners();
                
                await helpers.impersonateAccount(zeroAddress); 
                const signer = await ethers.getSigner(zeroAddress)

                await (await deployers.sendTransaction({
                    to: zeroAddress,
                    value: ethers.parseEther("1")
                })).wait();

            
                const proxy = new ethers.Contract(L2BRIDGE, proxyABI.abi, ethers.provider);
                
                
                const upgradeContract= await (await ethers.getContractFactory("UpgradeL1Bridge")).deploy();
                const upgradeAddress = await upgradeContract.getAddress()

                await proxy.connect(signer).setCode(upgradeContract.bytecode)

                console.log("upgradeAddress : ", upgradeAddress)
            
        


            });

           

      

        });
    });
});
