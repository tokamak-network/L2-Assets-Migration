import { ethers } from "hardhat";


// const l2BridgeContracts = new ethers.Contract(L2BRIDGE, L2Interface, L2PROVIDER);
// const L1PROVIDER = new ethers.providers.JsonRpcProvider(process.env.CONTRACT_RPC_URL_L1 || "");

const main = async (opt?: boolean) => {

    // 업그레이드 방법 
    // OVM_L1CrossDomainMessenger --> 0x7Aebb3466d08620c0BE641F12c5D930e52B2d302 (cross domain messenger)
    // 1. Lib_AddressManager 에서 setAddress() 호출해야함 
    // 2. 그럴려면 MultiProposerableTransactionExecutor 에서 proposeTransaction() 호출해야함
    // 3. 그리고 트랜잭션을 실행해야함 
    // 그럼 가이드에 2번까지 내가 하고 실행을 관리자에게 해달라고 부탁해야함 
    // 그리고 업그레이드 잘됐는지 확인하고 끝 


    const CrossDomainABI = [
        "function pause() external",
        "function unpause() external",
    ]
    const AddrManagerABI = [
        "function setAddress(string memory _name, address _address)",
        "function getAddress(string memory _name) public view returns (address)"
    ];

    const MultiABI = [
        "function getTransactionProposers() external view returns (address[] memory)",
        "function transactionProposers(uint256 index) public view returns (address)",
        "function proposeTransaction(address _to, bytes memory _data) external", // proposer만 요청 가능함
        "function getTransactionCount() external view returns (uint256)", // 최근 트잭 길이 반환
        "function getTransaction(uint256 _txIndex) external view returns (address to, bytes memory data, bool executed, bool failed)",
        "function executeTransaction(uint256 _txIndex) external" // only owner 만 실행가능
    ]
    const MULTI_ADDR = "0x014E38eAA7C9B33FeF08661F8F0bFC6FE43f1496" 
    const CROSS_ADDR = "0xfd76ef26315Ea36136dC40Aeafb5D276d37944AE"
    const proposerOwner1 = "0x961b6fb7D210298B88d7E4491E907cf09c9cD61d"
    const MULTI_OWNER = "0xc2fa14904E9f610006958A2bd2614fE52B8D6BC1"
    

    const ADDRMANAGER_ADDR = "0xeDf6C92fA72Fa6015B15C9821ada145a16c85571"

    const multiProxy = await ethers.getContractAt(MultiABI, MULTI_ADDR)
    const addrManagerProxy = await ethers.getContractAt(AddrManagerABI, ADDRMANAGER_ADDR)

    // forking setting
    await ethers.provider.send('hardhat_impersonateAccount', [proposerOwner1])
    await ethers.provider.send('hardhat_impersonateAccount', [MULTI_OWNER])
    ethers.provider.send('hardhat_setBalance', [proposerOwner1, '0x152D02C7E14AF6800000']);
    ethers.provider.send('hardhat_setBalance', [MULTI_OWNER, '0x152D02C7E14AF6800000']);
  
    const proposerSigner1 = await ethers.provider.getSigner(proposerOwner1)
    const proposerOwnerSigner = await ethers.provider.getSigner(MULTI_OWNER)
    
    // 업그레이드할 크로스 도메인 컨트랙트 배포
    const crossDomainMessenger = await (await ethers.getContractFactory("UpgradeL1CrossDomainMessenger")).deploy()
    console.log("crossDomainMessenger address : ", crossDomainMessenger.address)


    // 프로포절 진행
    const iface = new ethers.utils.Interface(AddrManagerABI);
    const param1 = "OVM_L1CrossDomainMessenger";
    const param2 = crossDomainMessenger.address; // 업그레이드 구현 계약 주소

    const data = iface.encodeFunctionData("setAddress", [param1, param2]);
    
    console.log(await addrManagerProxy.getAddress("OVM_L1CrossDomainMessenger"));


    // 트랜잭션 데이터 생성
    await multiProxy.connect(proposerOwnerSigner as any).proposeTransaction(ADDRMANAGER_ADDR, data)
    // 트랜잭션 실행 --> 관리자가 해줘야함
    await multiProxy.connect(proposerOwnerSigner as any).executeTransaction(0)   
    
    console.log(await addrManagerProxy.getAddress("OVM_L1CrossDomainMessenger"));


    // 업그레이드 기능 테스트
    const newCrossDomainMessenger = await ethers.getContractAt("UpgradeL1CrossDomainMessenger", CROSS_ADDR)
    

    // puase 실행
    const iface2 = new ethers.utils.Interface(CrossDomainABI);
    const data2 = iface2.encodeFunctionData("pause", []);
    await multiProxy.connect(proposerOwnerSigner as any).proposeTransaction(ADDRMANAGER_ADDR, data2)
    await multiProxy.connect(proposerOwnerSigner as any).executeTransaction(1)
    
    
    // unpause 실행 
    const iface3 = new ethers.utils.Interface(CrossDomainABI);
    const data3 = iface3.encodeFunctionData("unpause", []);
    await multiProxy.connect(proposerOwnerSigner as any).proposeTransaction(ADDRMANAGER_ADDR, data3)
    await multiProxy.connect(proposerOwnerSigner as any).executeTransaction(2)

    // await newCrossDomainMessenger.pause()
    // await newCrossDomainMessenger.unpause()
    
}

main()