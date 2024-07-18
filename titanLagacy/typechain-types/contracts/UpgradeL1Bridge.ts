/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../common";

export declare namespace UpgradeL1Bridge {
  export type ForceRegistryParamStruct = {
    position: PromiseOrValue<string>;
    state: PromiseOrValue<boolean>;
  };

  export type ForceRegistryParamStructOutput = [string, boolean] & {
    position: string;
    state: boolean;
  };

  export type ForceClaimParamStruct = {
    position: PromiseOrValue<string>;
    hashed: PromiseOrValue<string>;
    token: PromiseOrValue<string>;
    amount: PromiseOrValue<BigNumberish>;
  };

  export type ForceClaimParamStructOutput = [
    string,
    string,
    string,
    BigNumber
  ] & { position: string; hashed: string; token: string; amount: BigNumber };
}

export interface UpgradeL1BridgeInterface extends utils.Interface {
  functions: {
    "active()": FunctionFragment;
    "depositERC20(address,address,uint256,uint32,bytes)": FunctionFragment;
    "depositERC20To(address,address,address,uint256,uint32,bytes)": FunctionFragment;
    "depositETH(uint32,bytes)": FunctionFragment;
    "depositETHTo(address,uint32,bytes)": FunctionFragment;
    "deposits(address,address)": FunctionFragment;
    "donateETH()": FunctionFragment;
    "finalizeERC20Withdrawal(address,address,address,address,uint256,bytes)": FunctionFragment;
    "finalizeETHWithdrawal(address,address,uint256,bytes)": FunctionFragment;
    "forceActive(bool)": FunctionFragment;
    "forceModify((address,bool)[])": FunctionFragment;
    "forceRegistry(address[])": FunctionFragment;
    "forceWithdrawClaim(address,string,address,uint256)": FunctionFragment;
    "forceWithdrawClaimAll((address,string,address,uint256)[])": FunctionFragment;
    "gb(bytes32)": FunctionFragment;
    "getForcePosition(string)": FunctionFragment;
    "initialize(address,address)": FunctionFragment;
    "l2TokenBridge()": FunctionFragment;
    "messenger()": FunctionFragment;
    "position(address)": FunctionFragment;
    "positions(uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "active"
      | "depositERC20"
      | "depositERC20To"
      | "depositETH"
      | "depositETHTo"
      | "deposits"
      | "donateETH"
      | "finalizeERC20Withdrawal"
      | "finalizeETHWithdrawal"
      | "forceActive"
      | "forceModify"
      | "forceRegistry"
      | "forceWithdrawClaim"
      | "forceWithdrawClaimAll"
      | "gb"
      | "getForcePosition"
      | "initialize"
      | "l2TokenBridge"
      | "messenger"
      | "position"
      | "positions"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "active", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "depositERC20",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "depositERC20To",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "depositETH",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "depositETHTo",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "deposits",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(functionFragment: "donateETH", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "finalizeERC20Withdrawal",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "finalizeETHWithdrawal",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "forceActive",
    values: [PromiseOrValue<boolean>]
  ): string;
  encodeFunctionData(
    functionFragment: "forceModify",
    values: [UpgradeL1Bridge.ForceRegistryParamStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "forceRegistry",
    values: [PromiseOrValue<string>[]]
  ): string;
  encodeFunctionData(
    functionFragment: "forceWithdrawClaim",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "forceWithdrawClaimAll",
    values: [UpgradeL1Bridge.ForceClaimParamStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "gb",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "getForcePosition",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "l2TokenBridge",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "messenger", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "position",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "positions",
    values: [PromiseOrValue<BigNumberish>]
  ): string;

  decodeFunctionResult(functionFragment: "active", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "depositERC20",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "depositERC20To",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "depositETH", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "depositETHTo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "deposits", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "donateETH", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "finalizeERC20Withdrawal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "finalizeETHWithdrawal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "forceActive",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "forceModify",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "forceRegistry",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "forceWithdrawClaim",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "forceWithdrawClaimAll",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "gb", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getForcePosition",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "l2TokenBridge",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "messenger", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "position", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "positions", data: BytesLike): Result;

  events: {
    "ERC20DepositInitiated(address,address,address,address,uint256,bytes)": EventFragment;
    "ERC20WithdrawalFinalized(address,address,address,address,uint256,bytes)": EventFragment;
    "ETHDepositInitiated(address,address,uint256,bytes)": EventFragment;
    "ETHWithdrawalFinalized(address,address,uint256,bytes)": EventFragment;
    "ForceWithdraw(bytes32,address,uint256,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "ERC20DepositInitiated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ERC20WithdrawalFinalized"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ETHDepositInitiated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ETHWithdrawalFinalized"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ForceWithdraw"): EventFragment;
}

export interface ERC20DepositInitiatedEventObject {
  _l1Token: string;
  _l2Token: string;
  _from: string;
  _to: string;
  _amount: BigNumber;
  _data: string;
}
export type ERC20DepositInitiatedEvent = TypedEvent<
  [string, string, string, string, BigNumber, string],
  ERC20DepositInitiatedEventObject
>;

export type ERC20DepositInitiatedEventFilter =
  TypedEventFilter<ERC20DepositInitiatedEvent>;

export interface ERC20WithdrawalFinalizedEventObject {
  _l1Token: string;
  _l2Token: string;
  _from: string;
  _to: string;
  _amount: BigNumber;
  _data: string;
}
export type ERC20WithdrawalFinalizedEvent = TypedEvent<
  [string, string, string, string, BigNumber, string],
  ERC20WithdrawalFinalizedEventObject
>;

export type ERC20WithdrawalFinalizedEventFilter =
  TypedEventFilter<ERC20WithdrawalFinalizedEvent>;

export interface ETHDepositInitiatedEventObject {
  _from: string;
  _to: string;
  _amount: BigNumber;
  _data: string;
}
export type ETHDepositInitiatedEvent = TypedEvent<
  [string, string, BigNumber, string],
  ETHDepositInitiatedEventObject
>;

export type ETHDepositInitiatedEventFilter =
  TypedEventFilter<ETHDepositInitiatedEvent>;

export interface ETHWithdrawalFinalizedEventObject {
  _from: string;
  _to: string;
  _amount: BigNumber;
  _data: string;
}
export type ETHWithdrawalFinalizedEvent = TypedEvent<
  [string, string, BigNumber, string],
  ETHWithdrawalFinalizedEventObject
>;

export type ETHWithdrawalFinalizedEventFilter =
  TypedEventFilter<ETHWithdrawalFinalizedEvent>;

export interface ForceWithdrawEventObject {
  _index: string;
  _token: string;
  amount: BigNumber;
  _claimer: string;
}
export type ForceWithdrawEvent = TypedEvent<
  [string, string, BigNumber, string],
  ForceWithdrawEventObject
>;

export type ForceWithdrawEventFilter = TypedEventFilter<ForceWithdrawEvent>;

export interface UpgradeL1Bridge extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: UpgradeL1BridgeInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    active(overrides?: CallOverrides): Promise<[boolean]>;

    depositERC20(
      _l1Token: PromiseOrValue<string>,
      _l2Token: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      _l2Gas: PromiseOrValue<BigNumberish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    depositERC20To(
      _l1Token: PromiseOrValue<string>,
      _l2Token: PromiseOrValue<string>,
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      _l2Gas: PromiseOrValue<BigNumberish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    depositETH(
      _l2Gas: PromiseOrValue<BigNumberish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    depositETHTo(
      _to: PromiseOrValue<string>,
      _l2Gas: PromiseOrValue<BigNumberish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    deposits(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    donateETH(
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    finalizeERC20Withdrawal(
      _l1Token: PromiseOrValue<string>,
      _l2Token: PromiseOrValue<string>,
      _from: PromiseOrValue<string>,
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    finalizeETHWithdrawal(
      _from: PromiseOrValue<string>,
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    forceActive(
      _state: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    forceModify(
      _data: UpgradeL1Bridge.ForceRegistryParamStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    forceRegistry(
      _position: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    forceWithdrawClaim(
      _position: PromiseOrValue<string>,
      _hash: PromiseOrValue<string>,
      _token: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    forceWithdrawClaimAll(
      params: UpgradeL1Bridge.ForceClaimParamStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    gb(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getForcePosition(
      _key: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    initialize(
      _l1messenger: PromiseOrValue<string>,
      _l2TokenBridge: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    l2TokenBridge(overrides?: CallOverrides): Promise<[string]>;

    messenger(overrides?: CallOverrides): Promise<[string]>;

    position(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    positions(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;
  };

  active(overrides?: CallOverrides): Promise<boolean>;

  depositERC20(
    _l1Token: PromiseOrValue<string>,
    _l2Token: PromiseOrValue<string>,
    _amount: PromiseOrValue<BigNumberish>,
    _l2Gas: PromiseOrValue<BigNumberish>,
    _data: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  depositERC20To(
    _l1Token: PromiseOrValue<string>,
    _l2Token: PromiseOrValue<string>,
    _to: PromiseOrValue<string>,
    _amount: PromiseOrValue<BigNumberish>,
    _l2Gas: PromiseOrValue<BigNumberish>,
    _data: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  depositETH(
    _l2Gas: PromiseOrValue<BigNumberish>,
    _data: PromiseOrValue<BytesLike>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  depositETHTo(
    _to: PromiseOrValue<string>,
    _l2Gas: PromiseOrValue<BigNumberish>,
    _data: PromiseOrValue<BytesLike>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  deposits(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  donateETH(
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  finalizeERC20Withdrawal(
    _l1Token: PromiseOrValue<string>,
    _l2Token: PromiseOrValue<string>,
    _from: PromiseOrValue<string>,
    _to: PromiseOrValue<string>,
    _amount: PromiseOrValue<BigNumberish>,
    _data: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  finalizeETHWithdrawal(
    _from: PromiseOrValue<string>,
    _to: PromiseOrValue<string>,
    _amount: PromiseOrValue<BigNumberish>,
    _data: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  forceActive(
    _state: PromiseOrValue<boolean>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  forceModify(
    _data: UpgradeL1Bridge.ForceRegistryParamStruct[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  forceRegistry(
    _position: PromiseOrValue<string>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  forceWithdrawClaim(
    _position: PromiseOrValue<string>,
    _hash: PromiseOrValue<string>,
    _token: PromiseOrValue<string>,
    _amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  forceWithdrawClaimAll(
    params: UpgradeL1Bridge.ForceClaimParamStruct[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  gb(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<string>;

  getForcePosition(
    _key: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string>;

  initialize(
    _l1messenger: PromiseOrValue<string>,
    _l2TokenBridge: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  l2TokenBridge(overrides?: CallOverrides): Promise<string>;

  messenger(overrides?: CallOverrides): Promise<string>;

  position(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  positions(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  callStatic: {
    active(overrides?: CallOverrides): Promise<boolean>;

    depositERC20(
      _l1Token: PromiseOrValue<string>,
      _l2Token: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      _l2Gas: PromiseOrValue<BigNumberish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    depositERC20To(
      _l1Token: PromiseOrValue<string>,
      _l2Token: PromiseOrValue<string>,
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      _l2Gas: PromiseOrValue<BigNumberish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    depositETH(
      _l2Gas: PromiseOrValue<BigNumberish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    depositETHTo(
      _to: PromiseOrValue<string>,
      _l2Gas: PromiseOrValue<BigNumberish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    deposits(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    donateETH(overrides?: CallOverrides): Promise<void>;

    finalizeERC20Withdrawal(
      _l1Token: PromiseOrValue<string>,
      _l2Token: PromiseOrValue<string>,
      _from: PromiseOrValue<string>,
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    finalizeETHWithdrawal(
      _from: PromiseOrValue<string>,
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    forceActive(
      _state: PromiseOrValue<boolean>,
      overrides?: CallOverrides
    ): Promise<void>;

    forceModify(
      _data: UpgradeL1Bridge.ForceRegistryParamStruct[],
      overrides?: CallOverrides
    ): Promise<void>;

    forceRegistry(
      _position: PromiseOrValue<string>[],
      overrides?: CallOverrides
    ): Promise<void>;

    forceWithdrawClaim(
      _position: PromiseOrValue<string>,
      _hash: PromiseOrValue<string>,
      _token: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    forceWithdrawClaimAll(
      params: UpgradeL1Bridge.ForceClaimParamStruct[],
      overrides?: CallOverrides
    ): Promise<void>;

    gb(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<string>;

    getForcePosition(
      _key: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string>;

    initialize(
      _l1messenger: PromiseOrValue<string>,
      _l2TokenBridge: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    l2TokenBridge(overrides?: CallOverrides): Promise<string>;

    messenger(overrides?: CallOverrides): Promise<string>;

    position(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    positions(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;
  };

  filters: {
    "ERC20DepositInitiated(address,address,address,address,uint256,bytes)"(
      _l1Token?: PromiseOrValue<string> | null,
      _l2Token?: PromiseOrValue<string> | null,
      _from?: PromiseOrValue<string> | null,
      _to?: null,
      _amount?: null,
      _data?: null
    ): ERC20DepositInitiatedEventFilter;
    ERC20DepositInitiated(
      _l1Token?: PromiseOrValue<string> | null,
      _l2Token?: PromiseOrValue<string> | null,
      _from?: PromiseOrValue<string> | null,
      _to?: null,
      _amount?: null,
      _data?: null
    ): ERC20DepositInitiatedEventFilter;

    "ERC20WithdrawalFinalized(address,address,address,address,uint256,bytes)"(
      _l1Token?: PromiseOrValue<string> | null,
      _l2Token?: PromiseOrValue<string> | null,
      _from?: PromiseOrValue<string> | null,
      _to?: null,
      _amount?: null,
      _data?: null
    ): ERC20WithdrawalFinalizedEventFilter;
    ERC20WithdrawalFinalized(
      _l1Token?: PromiseOrValue<string> | null,
      _l2Token?: PromiseOrValue<string> | null,
      _from?: PromiseOrValue<string> | null,
      _to?: null,
      _amount?: null,
      _data?: null
    ): ERC20WithdrawalFinalizedEventFilter;

    "ETHDepositInitiated(address,address,uint256,bytes)"(
      _from?: PromiseOrValue<string> | null,
      _to?: PromiseOrValue<string> | null,
      _amount?: null,
      _data?: null
    ): ETHDepositInitiatedEventFilter;
    ETHDepositInitiated(
      _from?: PromiseOrValue<string> | null,
      _to?: PromiseOrValue<string> | null,
      _amount?: null,
      _data?: null
    ): ETHDepositInitiatedEventFilter;

    "ETHWithdrawalFinalized(address,address,uint256,bytes)"(
      _from?: PromiseOrValue<string> | null,
      _to?: PromiseOrValue<string> | null,
      _amount?: null,
      _data?: null
    ): ETHWithdrawalFinalizedEventFilter;
    ETHWithdrawalFinalized(
      _from?: PromiseOrValue<string> | null,
      _to?: PromiseOrValue<string> | null,
      _amount?: null,
      _data?: null
    ): ETHWithdrawalFinalizedEventFilter;

    "ForceWithdraw(bytes32,address,uint256,address)"(
      _index?: PromiseOrValue<BytesLike> | null,
      _token?: PromiseOrValue<string> | null,
      amount?: null,
      _claimer?: PromiseOrValue<string> | null
    ): ForceWithdrawEventFilter;
    ForceWithdraw(
      _index?: PromiseOrValue<BytesLike> | null,
      _token?: PromiseOrValue<string> | null,
      amount?: null,
      _claimer?: PromiseOrValue<string> | null
    ): ForceWithdrawEventFilter;
  };

  estimateGas: {
    active(overrides?: CallOverrides): Promise<BigNumber>;

    depositERC20(
      _l1Token: PromiseOrValue<string>,
      _l2Token: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      _l2Gas: PromiseOrValue<BigNumberish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    depositERC20To(
      _l1Token: PromiseOrValue<string>,
      _l2Token: PromiseOrValue<string>,
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      _l2Gas: PromiseOrValue<BigNumberish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    depositETH(
      _l2Gas: PromiseOrValue<BigNumberish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    depositETHTo(
      _to: PromiseOrValue<string>,
      _l2Gas: PromiseOrValue<BigNumberish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    deposits(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    donateETH(
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    finalizeERC20Withdrawal(
      _l1Token: PromiseOrValue<string>,
      _l2Token: PromiseOrValue<string>,
      _from: PromiseOrValue<string>,
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    finalizeETHWithdrawal(
      _from: PromiseOrValue<string>,
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    forceActive(
      _state: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    forceModify(
      _data: UpgradeL1Bridge.ForceRegistryParamStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    forceRegistry(
      _position: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    forceWithdrawClaim(
      _position: PromiseOrValue<string>,
      _hash: PromiseOrValue<string>,
      _token: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    forceWithdrawClaimAll(
      params: UpgradeL1Bridge.ForceClaimParamStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    gb(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getForcePosition(
      _key: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    initialize(
      _l1messenger: PromiseOrValue<string>,
      _l2TokenBridge: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    l2TokenBridge(overrides?: CallOverrides): Promise<BigNumber>;

    messenger(overrides?: CallOverrides): Promise<BigNumber>;

    position(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    positions(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    active(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    depositERC20(
      _l1Token: PromiseOrValue<string>,
      _l2Token: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      _l2Gas: PromiseOrValue<BigNumberish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    depositERC20To(
      _l1Token: PromiseOrValue<string>,
      _l2Token: PromiseOrValue<string>,
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      _l2Gas: PromiseOrValue<BigNumberish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    depositETH(
      _l2Gas: PromiseOrValue<BigNumberish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    depositETHTo(
      _to: PromiseOrValue<string>,
      _l2Gas: PromiseOrValue<BigNumberish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    deposits(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    donateETH(
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    finalizeERC20Withdrawal(
      _l1Token: PromiseOrValue<string>,
      _l2Token: PromiseOrValue<string>,
      _from: PromiseOrValue<string>,
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    finalizeETHWithdrawal(
      _from: PromiseOrValue<string>,
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    forceActive(
      _state: PromiseOrValue<boolean>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    forceModify(
      _data: UpgradeL1Bridge.ForceRegistryParamStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    forceRegistry(
      _position: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    forceWithdrawClaim(
      _position: PromiseOrValue<string>,
      _hash: PromiseOrValue<string>,
      _token: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    forceWithdrawClaimAll(
      params: UpgradeL1Bridge.ForceClaimParamStruct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    gb(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getForcePosition(
      _key: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    initialize(
      _l1messenger: PromiseOrValue<string>,
      _l2TokenBridge: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    l2TokenBridge(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    messenger(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    position(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    positions(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
