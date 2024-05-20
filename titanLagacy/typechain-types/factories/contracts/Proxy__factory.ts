/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type { Proxy, ProxyInterface } from "../../contracts/Proxy";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    inputs: [],
    name: "getImplementation",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getOwner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "_code",
        type: "bytes",
      },
    ],
    name: "setCode",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    name: "setOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_key",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "_value",
        type: "bytes32",
      },
    ],
    name: "setStorage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x6080604052341561000f57600080fd5b610d3a388190036080601f8201601f19168101906001600160401b038211908210171561004c57634e487b7160e01b600052604160045260246000fd5b6040528082608039602081121561006257600080fd5b50506080516001600160a01b038116811461007c57600080fd5b6100a4817fb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d610355565b50604051610c84806100b683398082f3fe60406080815260043610610108576000803560e01c6313af4035811461005057636c5d4ad081146100705763893d20e8811461008b57639b0b0fda81146100c65763aaf10f4281146100ea57610105565b341561005a578182fd5b61006b61006636610113565b610727565b818351f35b341561007a578182fd5b61006b61008636610256565b610370565b3415610095578182fd5b61009e366102fd565b6100a661079a565b835173ffffffffffffffffffffffffffffffffffffffff82168152602081f35b34156100d0578182fd5b6100d936610330565b6100e38183610617565b5050818351f35b34156100f4578182fd5b6100fd366102fd565b6100a66108ae565b50505b50610111610a83565b005b600060207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc8301121561014557600080fd5b60043573ffffffffffffffffffffffffffffffffffffffff8116811461016a57600080fd5b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6040810181811067ffffffffffffffff821117156101bf576101bf610170565b60405250565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f830116810181811067ffffffffffffffff8211171561020957610209610170565b6040525050565b600067ffffffffffffffff82111561022a5761022a610170565b50601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe01660200190565b600060207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc8301121561028857600080fd5b60043567ffffffffffffffff8111156102a057600080fd5b8260238201126102af57600080fd5b80600401356102bd81610210565b6040516102ca82826101c5565b8281528560248486010111156102df57600080fd5b82602485016020830137600092810160200192909252509392505050565b60007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc8201121561032d57600080fd5b50565b60008060407ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc8401121561036357600080fd5b5050600435916024359150565b7fb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d61035473ffffffffffffffffffffffffffffffffffffffff81163314806103b4575033155b8080156103c9576103c484610515565b610485565b604051602081017fb7947262000000000000000000000000000000000000000000000000000000008152600482526104008261019f565b600080835183885afa91505060003d60008114610444573d61042181610210565b60405161042e82826101c5565b8281528094503d6000602083013e505050610449565b606091505b50818215610458575080516020145b801561047a5761047a61047460208451850101602085016109e0565b156109f9565b505050610485610b5e565b50505050565b8061032d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603360248201527f4c314368756753706c61736850726f78793a20636f646520776173206e6f742060448201527f636f72726563746c79206465706c6f7965642e000000000000000000000000006064820152608481fd5b7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc548151602080840191822091833f831415610552575050505050565b604051935081840192507f600d380380600d6000396000f3000000000000000000000000000000000000008352845160005b818110156105a057868101840151868201602d01528301610584565b818111156105b2576000602d83880101525b508481860103925050600d820184526105ce602d8301856101c5565b8351836000f09350833f92506105e885518220841461048b565b505050610613817f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc55565b5050565b7fb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d61035473ffffffffffffffffffffffffffffffffffffffff811633148061065b575033155b80801561066a57848455610720565b604051602081017fb7947262000000000000000000000000000000000000000000000000000000008152600482526106a18261019f565b600080835183885afa91505060003d600081146106e5573d6106c281610210565b6040516106cf82826101c5565b8281528094503d6000602083013e5050506106ea565b606091505b508182156106f9575080516020145b80156107155761071561047460208451850101602085016109e0565b505050610720610b5e565b5050505050565b7fb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d61035473ffffffffffffffffffffffffffffffffffffffff811633148061076b575033155b8080156103c9576103c4847fb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d610355565b60007fb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103805473ffffffffffffffffffffffffffffffffffffffff81163314806107e1575033155b8080156107f157835494506108a7565b604051602081017fb7947262000000000000000000000000000000000000000000000000000000008152600482526108288261019f565b600080835183885afa91505060003d6000811461086c573d61084981610210565b60405161085682826101c5565b8281528094503d6000602083013e505050610871565b606091505b50818215610880575080516020145b801561089c5761089c61047460208451850101602085016109e0565b5050506108a7610b5e565b5050505090565b60007fb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d61035473ffffffffffffffffffffffffffffffffffffffff81163314806108f4575033155b808015610924577f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc5493506109da565b604051602081017fb79472620000000000000000000000000000000000000000000000000000000081526004825261095b8261019f565b600080835183885afa91505060003d6000811461099f573d61097c81610210565b60405161098982826101c5565b8281528094503d6000602083013e5050506109a4565b606091505b508182156109b3575080516020145b80156109cf576109cf61047460208451850101602085016109e0565b5050506109da610b5e565b50505090565b6000602082840312156109f257600080fd5b5051919050565b8061032d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603560248201527f4c314368756753706c61736850726f78793a2073797374656d2069732063757260448201527f72656e746c79206265696e6720757067726164656400000000000000000000006064820152608481fd5b7fb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d610354604051602081017fb794726200000000000000000000000000000000000000000000000000000000815260048252610adc8261019f565b600080835183865afa9250505060003d60008114610b21573d610afe81610210565b604051610b0b82826101c5565b8281528094503d6000602083013e505050610b26565b606091505b50818215610b35575080516020145b8015610b5157610b5161047460208451850101602085016109e0565b505050610b5c610b5e565b565b7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc5473ffffffffffffffffffffffffffffffffffffffff8116610c20576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603060248201527f4c314368756753706c61736850726f78793a20696d706c656d656e746174696f60448201527f6e206973206e6f742073657420796574000000000000000000000000000000006064820152608481fd5b60003681823780813683855af491503d81823e81610c3c573d81fd5b3d81f3fea3646970667358221220dda845c50caebf4f07c6f0bd6544df91918f376852bf17f572a76cfce23b6a7e6c6578706572696d656e74616cf564736f6c63430008090041";

type ProxyConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ProxyConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Proxy__factory extends ContractFactory {
  constructor(...args: ProxyConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _owner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Proxy> {
    return super.deploy(_owner, overrides || {}) as Promise<Proxy>;
  }
  override getDeployTransaction(
    _owner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_owner, overrides || {});
  }
  override attach(address: string): Proxy {
    return super.attach(address) as Proxy;
  }
  override connect(signer: Signer): Proxy__factory {
    return super.connect(signer) as Proxy__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ProxyInterface {
    return new utils.Interface(_abi) as ProxyInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Proxy {
    return new Contract(address, _abi, signerOrProvider) as Proxy;
  }
}