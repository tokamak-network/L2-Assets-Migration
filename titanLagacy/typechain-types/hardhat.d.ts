/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { ethers } from "ethers";
import {
  FactoryOptions,
  HardhatEthersHelpers as HardhatEthersHelpersBase,
} from "@nomiclabs/hardhat-ethers/types";

import * as Contracts from ".";

declare module "hardhat/types/runtime" {
  interface HardhatEthersHelpers extends HardhatEthersHelpersBase {
    getContractFactory(
      name: "IERC20Permit",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20Permit__factory>;
    getContractFactory(
      name: "IERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20__factory>;
    getContractFactory(
      name: "GenFWStorage1",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.GenFWStorage1__factory>;
    getContractFactory(
      name: "GenFWStorage2",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.GenFWStorage2__factory>;
    getContractFactory(
      name: "L1StandardBridge",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.L1StandardBridge__factory>;
    getContractFactory(
      name: "Proxy",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Proxy__factory>;
    getContractFactory(
      name: "UpgradeL1Bridge",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.UpgradeL1Bridge__factory>;
    getContractFactory(
      name: "IL1ChugSplashDeployer",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IL1ChugSplashDeployer__factory>;
    getContractFactory(
      name: "L1ChugSplashProxy",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.L1ChugSplashProxy__factory>;
    getContractFactory(
      name: "IL1ERC20Bridge",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IL1ERC20Bridge__factory>;
    getContractFactory(
      name: "IL1StandardBridge",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IL1StandardBridge__factory>;
    getContractFactory(
      name: "IL2ERC20Bridge",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IL2ERC20Bridge__factory>;
    getContractFactory(
      name: "CrossDomainEnabled",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.CrossDomainEnabled__factory>;
    getContractFactory(
      name: "ICrossDomainMessenger",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ICrossDomainMessenger__factory>;

    getContractAt(
      name: "IERC20Permit",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20Permit>;
    getContractAt(
      name: "IERC20",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20>;
    getContractAt(
      name: "GenFWStorage1",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.GenFWStorage1>;
    getContractAt(
      name: "GenFWStorage2",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.GenFWStorage2>;
    getContractAt(
      name: "L1StandardBridge",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.L1StandardBridge>;
    getContractAt(
      name: "Proxy",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Proxy>;
    getContractAt(
      name: "UpgradeL1Bridge",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.UpgradeL1Bridge>;
    getContractAt(
      name: "IL1ChugSplashDeployer",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IL1ChugSplashDeployer>;
    getContractAt(
      name: "L1ChugSplashProxy",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.L1ChugSplashProxy>;
    getContractAt(
      name: "IL1ERC20Bridge",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IL1ERC20Bridge>;
    getContractAt(
      name: "IL1StandardBridge",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IL1StandardBridge>;
    getContractAt(
      name: "IL2ERC20Bridge",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IL2ERC20Bridge>;
    getContractAt(
      name: "CrossDomainEnabled",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.CrossDomainEnabled>;
    getContractAt(
      name: "ICrossDomainMessenger",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ICrossDomainMessenger>;

    // default types
    getContractFactory(
      name: string,
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<ethers.ContractFactory>;
    getContractFactory(
      abi: any[],
      bytecode: ethers.utils.BytesLike,
      signer?: ethers.Signer
    ): Promise<ethers.ContractFactory>;
    getContractAt(
      nameOrAbi: string | any[],
      address: string,
      signer?: ethers.Signer
    ): Promise<ethers.Contract>;
  }
}
