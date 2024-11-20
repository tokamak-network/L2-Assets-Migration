// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/* Interface Imports */
import { IL1StandardBridge } from "sub/packages/tokamak/contracts/contracts/L1/messaging/IL1StandardBridge.sol";
import { IL1ERC20Bridge } from "sub/packages/tokamak/contracts/contracts/L1/messaging/IL1ERC20Bridge.sol";
import { IL2ERC20Bridge } from "sub/packages/tokamak/contracts/contracts/L2/messaging/IL2ERC20Bridge.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/* Library Imports */
import { CrossDomainEnabled } from "sub/packages/tokamak/contracts/contracts/libraries/bridge/CrossDomainEnabled.sol";
import { Lib_PredeployAddresses } from "sub/packages/tokamak/contracts/contracts/libraries/constants/Lib_PredeployAddresses.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MockL1StandardBridge is IL1StandardBridge, CrossDomainEnabled {
    using SafeERC20 for IERC20;

    address public l2TokenBridge;

    // Maps L1 token to L2 token to balance of the L1 token deposited
    mapping(address => mapping(address => uint256)) public deposits;

    // This contract lives behind a proxy, so the constructor parameters will go unused.
    constructor() CrossDomainEnabled(address(0)) {}
    /**
     * @param _l1messenger L1 Messenger address being used for cross-chain communications.
     * @param _l2TokenBridge L2 standard bridge address.
     */
    // slither-disable-next-line external-function
    function initialize(address _l1messenger, address _l2TokenBridge) public {
        require(messenger == address(0), "Contract has already been initialized.");
        messenger = _l1messenger;
        l2TokenBridge = _l2TokenBridge;
    }

    /**************
     * Depositing *
     **************/

    /** @dev Modifier requiring sender to be EOA.  This check could be bypassed by a malicious
     *  contract via initcode, but it takes care of the user error we want to avoid.
     */
    modifier onlyEOA() {
        // Used to stop deposits from contracts (avoid accidentally lost tokens)
        require(!Address.isContract(msg.sender), "Account not EOA");
        _;
    }

    /**
     * @dev This function can be called with no data
     * to deposit an amount of ETH to the caller's balance on L2.
     * Since the receive function doesn't take data, a conservative
     * default amount is forwarded to L2.
     */
    receive() external payable onlyEOA {
        _initiateETHDeposit(msg.sender, msg.sender, 200_000, bytes(""));
    }

    /**
     * @inheritdoc IL1StandardBridge
     */
    function depositETH(uint32 _l2Gas, bytes calldata _data) external payable onlyEOA {
        _initiateETHDeposit(msg.sender, msg.sender, _l2Gas, _data);
    }

    /**
     * @inheritdoc IL1StandardBridge
     */
    function depositETHTo(
        address _to,
        uint32 _l2Gas,
        bytes calldata _data
    ) external payable {
        _initiateETHDeposit(msg.sender, _to, _l2Gas, _data);
    }

    /**
     * @dev Performs the logic for deposits by storing the ETH and informing the L2 ETH Gateway of
     * the deposit.
     * @param _from Account to pull the deposit from on L1.
     * @param _to Account to give the deposit to on L2.
     * @param _l2Gas Gas limit required to complete the deposit on L2.
     * @param _data Optional data to forward to L2. This data is provided
     *        solely as a convenience for external contracts. Aside from enforcing a maximum
     *        length, these contracts provide no guarantees about its content.
     */
    function _initiateETHDeposit(
        address _from,
        address _to,
        uint32 _l2Gas,
        bytes memory _data
    ) internal {
        // // Construct calldata for finalizeDeposit call
        // bytes memory message = abi.encodeWithSelector(
        //     IL2ERC20Bridge.finalizeDeposit.selector,
        //     address(0),
        //     Lib_PredeployAddresses.OVM_ETH,
        //     _from,
        //     _to,
        //     msg.value,
        //     _data
        // );

        // // Send calldata into L2
        // // slither-disable-next-line reentrancy-events
        // sendCrossDomainMessage(l2TokenBridge, _l2Gas, message);

        // slither-disable-next-line reentrancy-events
        emit ETHDepositInitiated(_from, _to, msg.value, _data);
    }

    /**
     * @inheritdoc IL1ERC20Bridge
     */
    function depositERC20(
        address _l1Token,
        address _l2Token,
        uint256 _amount,
        uint32 _l2Gas,
        bytes calldata _data
    ) external virtual onlyEOA  paused {
        _initiateERC20Deposit(_l1Token, _l2Token, msg.sender, msg.sender, _amount, _l2Gas, _data);
    }

    /**
     * @inheritdoc IL1ERC20Bridge
     */
    function depositERC20To(
        address _l1Token,
        address _l2Token,
        address _to,
        uint256 _amount,
        uint32 _l2Gas,
        bytes calldata _data
    ) external virtual paused {
        _initiateERC20Deposit(_l1Token, _l2Token, msg.sender, _to, _amount, _l2Gas, _data);
    }

    /**
     * @dev Performs the logic for deposits by informing the L2 Deposited Token
     * contract of the deposit and calling a handler to lock the L1 funds. (e.g. transferFrom)
     *
     * @param _l1Token Address of the L1 ERC20 we are depositing
     * @param _l2Token Address of the L1 respective L2 ERC20
     * @param _from Account to pull the deposit from on L1
     * @param _to Account to give the deposit to on L2
     * @param _amount Amount of the ERC20 to deposit.
     * @param _l2Gas Gas limit required to complete the deposit on L2.
     * @param _data Optional data to forward to L2. This data is provided
     *        solely as a convenience for external contracts. Aside from enforcing a maximum
     *        length, these contracts provide no guarantees about its content.
     */
    function _initiateERC20Deposit(
        address _l1Token,
        address _l2Token,
        address _from,
        address _to,
        uint256 _amount,
        uint32 _l2Gas,
        bytes calldata _data
    ) internal {
        // When a deposit is initiated on L1, the L1 Bridge transfers the funds to itself for future
        // withdrawals. The use of safeTransferFrom enables support of "broken tokens" which do not
        // return a boolean value.
        // slither-disable-next-line reentrancy-events, reentrancy-benign
        IERC20(_l1Token).safeTransferFrom(_from, address(this), _amount);

        // // Construct calldata for _l2Token.finalizeDeposit(_to, _amount)
        // bytes memory message = abi.encodeWithSelector(
        //     IL2ERC20Bridge.finalizeDeposit.selector,
        //     _l1Token,
        //     _l2Token,
        //     _from,
        //     _to,
        //     _amount,
        //     _data
        // );

        // // Send calldata into L2
        // // slither-disable-next-line reentrancy-events, reentrancy-benign
        // sendCrossDomainMessage(l2TokenBridge, _l2Gas, message);

        // slither-disable-next-line reentrancy-benign
        deposits[_l1Token][_l2Token] = deposits[_l1Token][_l2Token] + _amount;

        // slither-disable-next-line reentrancy-events
        emit ERC20DepositInitiated(_l1Token, _l2Token, _from, _to, _amount, _data);
    }

    /*************************
     * Cross-chain Functions *
     *************************/

    /**
     * @inheritdoc IL1StandardBridge
     */
    function finalizeETHWithdrawal(
        address _from,
        address _to,
        uint256 _amount,
        bytes calldata _data
    ) external onlyFromCrossDomainAccount(l2TokenBridge) {
        // slither-disable-next-line reentrancy-events
        (bool success, ) = _to.call{ value: _amount }(new bytes(0));
        require(success, "TransferHelper::safeTransferETH: ETH transfer failed");

        // slither-disable-next-line reentrancy-events
        emit ETHWithdrawalFinalized(_from, _to, _amount, _data);
    }

    // 춝금 파이널라이징
    /**
     * @inheritdoc IL1ERC20Bridge
     */
    function finalizeERC20Withdrawal(
        address _l1Token,
        address _l2Token,
        address _from,
        address _to,
        uint256 _amount,
        bytes calldata _data
    ) external onlyFromCrossDomainAccount(l2TokenBridge)  {
        deposits[_l1Token][_l2Token] = deposits[_l1Token][_l2Token] - _amount;

        // When a withdrawal is finalized on L1, the L1 Bridge transfers the funds to the withdrawer
        // slither-disable-next-line reentrancy-events
        IERC20(_l1Token).safeTransfer(_to, _amount);

        // slither-disable-next-line reentrancy-events
        emit ERC20WithdrawalFinalized(_l1Token, _l2Token, _from, _to, _amount, _data);
    }

    /*****************************
     * Temporary - Migrating ETH *
     *****************************/

    /**
     * @dev Adds ETH balance to the account. This is meant to allow for ETH
     * to be migrated from an old gateway to a new gateway.
     * NOTE: This is left for one upgrade only so we are able to receive the migrated ETH from the
     * old contract
     */
    function donateETH() external payable {}

     bool public active = false;

    /// @notice Indicates whether the protocol is active. When running an automated script, the status is tracked and set to True.
    /// @custom:modifier This is a constructor that blocks function access rights. Only Closer can change its state.
    modifier paused() {
        if (active) revert("Paused L1StandardBridge");
        _;
    }


    // ForceWitdraw Protocol
    error FW_ONLY_CLOSER();
    error FW_NOT_AVAILABLE_POSITION();
    error FW_NOT_SEARCH_POSITION();
    error FW_INVALID_HASH(); 
    error FW_FAIl_TRANSFER_ETH();
    event ForceWithdraw(bytes32 indexed _index, address indexed _token, uint amount, address indexed _claimer);

    /**
     * @dev Parameter structure for requesting forced withdrawal
     * @param position Contract address where the _hash value is stored.
     * @param hashed Hash value of token information that can be force withdaraw from the L1 bridge.
     * @param token L1 token address to receive.
     * @param amount Amount of tokens to receive.
     */  
    struct ForceClaimParam {
        address position;
        string hashed;
        address token;
        uint amount;
    }
    /**
     * @dev Structure to hold registration parameters.
     * @param position Address used as a key in a mapping to set the state.
     * @param state Boolean state indicating some condition or status.
     */
    struct ForceRegistryParam {
        address position;
        bool state;    
    }
    /// @notice (token,claim,amount) Hashed value => address of the claimer.
    mapping(bytes32 => address) public gb; 
     /// @notice GenFWStorage{x}.sol Stores the addresses of the contract => Active status of storage, false is not available.
    mapping(address => bool) public position;
    /// @notice (token,claim,amount) Stores Hashed value, used to check position status in front service.
    address[] public positions; 
    
    /// @notice Addresses of Multisig and DAO contracts that will control the protocol
    address private constant closer = 0x6526728cfDcB07C63CA66fE36b5aA202067eE75b;

    /// @notice If the transfer is successful, the event below is executed.
    /// @dev event ForceWithdraw(bytes32 indexed _index,address indexed _token,address indexed _claimer,uint amount)
    bytes32 private constant EMIT_FORCE_WITHDRAW = 0x3f8d5b1115561be924ebdce8f16fc7c9e2fe8c67b4db21016dc2a5d5e367c8d3;

    /// @notice Checks if the caller is the authorized 'closer' address
    /// @dev Modifier that allows function execution only by the designated 'closer'
    /// @custom:modifier onlyCloser Ensures only the designated closer can call the modified function
    modifier onlyCloser() {
        if (msg.sender != closer) revert FW_ONLY_CLOSER();
        _;
    }

    function forceActive(bool _state) external onlyCloser {
        active = _state;
    }

  
    function forceRegistry(address[] calldata _position) external onlyCloser { 
        for(uint i = 0 ; i < _position.length; i++){
            position[_position[i]] = true;
            positions.push(_position[i]);
        }
    }

  
    function forceModify(ForceRegistryParam[] calldata _data) external onlyCloser {
        for(uint i = 0 ; i < _data.length; i++){
            position[_data[i].position] = _data[i].state;
        }
    }

    function getForcePosition(string memory _key) external view returns (address) {
        string memory f = string(abi.encodePacked("_", _key,"()"));
        for(uint i = 0 ; i < positions.length; i++) {
            address p = positions[i]; 
                    
            (bool success, bytes memory data) = p.staticcall(abi.encodeWithSignature(f));
            
            if (success) {
                bytes32 r = abi.decode(data, (bytes32));
                if(r == 0) {
                    continue;
                }
                return p;
            }
        }
        return address(0);
    }

    
    function forceWithdrawClaimAll(ForceClaimParam[] calldata params) external {
        for(uint i = 0; i < params.length; i++) {
            claim(params[i].position, params[i].hashed, params[i].token, params[i].amount);
        }
    }
    
  
    function forceWithdrawClaim(address _position, string memory _hash, address _token, uint _amount) external {
        claim(_position, _hash, _token, _amount);
    }

    
  
    function claim(address _position, string memory _hash, address _token, uint _amount) internal {
        if(!position[_position]) revert FW_NOT_AVAILABLE_POSITION();
        
        string memory f = string(abi.encodePacked("_",_hash,"()"));    
        (bool s, bytes memory d) = _position.staticcall(abi.encodeWithSignature(f));
        
        if (!s || d.length == 0) {
            revert FW_NOT_SEARCH_POSITION();
        }

        bytes32 v = keccak256(abi.encodePacked(_token, msg.sender, _amount));
        bytes32 r = abi.decode(d, (bytes32));

        if (v != r || gb[r] != address(0)) {
            revert FW_INVALID_HASH();
        }

        gb[r] = msg.sender;

        if (_token == address(0)) {
            (s, ) = msg.sender.call{ value: _amount }(new bytes(0));
            if(!s) revert FW_FAIl_TRANSFER_ETH();
        } else IERC20(_token).safeTransfer(msg.sender, _amount);

        emit ForceWithdraw(r, _token, _amount, msg.sender);
    }



}
