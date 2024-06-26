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
} from "../../../../../../../common";

export interface ICrossDomainMessengerInterface extends utils.Interface {
  functions: {
    "sendMessage(address,bytes,uint32)": FunctionFragment;
    "xDomainMessageSender()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "sendMessage" | "xDomainMessageSender"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "sendMessage",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "xDomainMessageSender",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "sendMessage",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "xDomainMessageSender",
    data: BytesLike
  ): Result;

  events: {
    "FailedRelayedFastMessage(address,address,bytes,uint256)": EventFragment;
    "FailedRelayedMessage(bytes32)": EventFragment;
    "RelayedFastMessage(address,address,bytes,uint256)": EventFragment;
    "RelayedMessage(bytes32)": EventFragment;
    "SentMessage(address,address,bytes,uint256,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "FailedRelayedFastMessage"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "FailedRelayedMessage"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RelayedFastMessage"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RelayedMessage"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SentMessage"): EventFragment;
}

export interface FailedRelayedFastMessageEventObject {
  target: string;
  sender: string;
  message: string;
  messageNonce: BigNumber;
}
export type FailedRelayedFastMessageEvent = TypedEvent<
  [string, string, string, BigNumber],
  FailedRelayedFastMessageEventObject
>;

export type FailedRelayedFastMessageEventFilter =
  TypedEventFilter<FailedRelayedFastMessageEvent>;

export interface FailedRelayedMessageEventObject {
  msgHash: string;
}
export type FailedRelayedMessageEvent = TypedEvent<
  [string],
  FailedRelayedMessageEventObject
>;

export type FailedRelayedMessageEventFilter =
  TypedEventFilter<FailedRelayedMessageEvent>;

export interface RelayedFastMessageEventObject {
  target: string;
  sender: string;
  message: string;
  messageNonce: BigNumber;
}
export type RelayedFastMessageEvent = TypedEvent<
  [string, string, string, BigNumber],
  RelayedFastMessageEventObject
>;

export type RelayedFastMessageEventFilter =
  TypedEventFilter<RelayedFastMessageEvent>;

export interface RelayedMessageEventObject {
  msgHash: string;
}
export type RelayedMessageEvent = TypedEvent<
  [string],
  RelayedMessageEventObject
>;

export type RelayedMessageEventFilter = TypedEventFilter<RelayedMessageEvent>;

export interface SentMessageEventObject {
  target: string;
  sender: string;
  message: string;
  messageNonce: BigNumber;
  gasLimit: BigNumber;
}
export type SentMessageEvent = TypedEvent<
  [string, string, string, BigNumber, BigNumber],
  SentMessageEventObject
>;

export type SentMessageEventFilter = TypedEventFilter<SentMessageEvent>;

export interface ICrossDomainMessenger extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ICrossDomainMessengerInterface;

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
    sendMessage(
      _target: PromiseOrValue<string>,
      _message: PromiseOrValue<BytesLike>,
      _gasLimit: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    xDomainMessageSender(overrides?: CallOverrides): Promise<[string]>;
  };

  sendMessage(
    _target: PromiseOrValue<string>,
    _message: PromiseOrValue<BytesLike>,
    _gasLimit: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  xDomainMessageSender(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    sendMessage(
      _target: PromiseOrValue<string>,
      _message: PromiseOrValue<BytesLike>,
      _gasLimit: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    xDomainMessageSender(overrides?: CallOverrides): Promise<string>;
  };

  filters: {
    "FailedRelayedFastMessage(address,address,bytes,uint256)"(
      target?: PromiseOrValue<string> | null,
      sender?: null,
      message?: null,
      messageNonce?: null
    ): FailedRelayedFastMessageEventFilter;
    FailedRelayedFastMessage(
      target?: PromiseOrValue<string> | null,
      sender?: null,
      message?: null,
      messageNonce?: null
    ): FailedRelayedFastMessageEventFilter;

    "FailedRelayedMessage(bytes32)"(
      msgHash?: PromiseOrValue<BytesLike> | null
    ): FailedRelayedMessageEventFilter;
    FailedRelayedMessage(
      msgHash?: PromiseOrValue<BytesLike> | null
    ): FailedRelayedMessageEventFilter;

    "RelayedFastMessage(address,address,bytes,uint256)"(
      target?: PromiseOrValue<string> | null,
      sender?: null,
      message?: null,
      messageNonce?: null
    ): RelayedFastMessageEventFilter;
    RelayedFastMessage(
      target?: PromiseOrValue<string> | null,
      sender?: null,
      message?: null,
      messageNonce?: null
    ): RelayedFastMessageEventFilter;

    "RelayedMessage(bytes32)"(
      msgHash?: PromiseOrValue<BytesLike> | null
    ): RelayedMessageEventFilter;
    RelayedMessage(
      msgHash?: PromiseOrValue<BytesLike> | null
    ): RelayedMessageEventFilter;

    "SentMessage(address,address,bytes,uint256,uint256)"(
      target?: PromiseOrValue<string> | null,
      sender?: null,
      message?: null,
      messageNonce?: null,
      gasLimit?: null
    ): SentMessageEventFilter;
    SentMessage(
      target?: PromiseOrValue<string> | null,
      sender?: null,
      message?: null,
      messageNonce?: null,
      gasLimit?: null
    ): SentMessageEventFilter;
  };

  estimateGas: {
    sendMessage(
      _target: PromiseOrValue<string>,
      _message: PromiseOrValue<BytesLike>,
      _gasLimit: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    xDomainMessageSender(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    sendMessage(
      _target: PromiseOrValue<string>,
      _message: PromiseOrValue<BytesLike>,
      _gasLimit: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    xDomainMessageSender(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
