import { ethers } from "hardhat";
import { expect } from "chai";

export default describe('# L1StandardBridge Deposit Pause Test', () => {
   
    it('Titan L1 Bridge Upgrade Test', async () => {

        // check environment variables
        if (process.env.CLOSER_ADDRESS === undefined || process.env.CLOSER_ADDRESS === "") {
            throw "Please set the environment variables in .env file {CLOSER_ADDRESS}"
        }

        // check environment variables
        if (process.env.CONTRACTS_L1BRIDGE_ADDRESS === undefined || process.env.CONTRACTS_L1BRIDGE_ADDRESS === "") {
            throw "Please set the environment variables in .env file {CLOSER_ADDRESS}"
        }

        // test account
        const owner = process.env.CLOSER_ADDRESS;
        await ethers.provider.send('hardhat_impersonateAccount', [owner])
        await ethers.provider.send('hardhat_setBalance', [owner, '0x152D02C7E14AF6800000']);
        const deployer:any = await ethers.provider.getSigner(owner)

        const l1bridge = await ethers.getContractAt("UpgradeL1Bridge", process.env.CONTRACTS_L1BRIDGE_ADDRESS)
        // await l1bridge.connect(deployer).forceActive(true);
        const state = await l1bridge.active(); 
        console.log("active state : ",state);

        const zeroAddress = ethers.constants.AddressZero
        if(state == true){
            //ERC20 
            await expect(l1bridge.depositERC20(zeroAddress, zeroAddress, 100000, 100000, ethers.utils.formatBytes32String("0x0"))).to.be.revertedWith("Paused L1StandardBridge")
            await expect(l1bridge.depositERC20To(zeroAddress, zeroAddress, owner, 100000, 100000, ethers.utils.formatBytes32String("0x0"))).to.be.revertedWith("Paused L1StandardBridge")

            // depositETH
            await expect(l1bridge.depositETH(100000, ethers.utils.formatBytes32String("0x0"))).to.be.revertedWith("Paused L1StandardBridge")
            await expect(l1bridge.depositETHTo(owner, 100000, ethers.utils.formatBytes32String("0x0"))).to.be.revertedWith("Paused L1StandardBridge")
            
        }else {
            throw "Change the L1Bridge active variable to the value true!";
        }
    });
});
