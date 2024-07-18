// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {L1StandardBridge} from "./L1StandardBridge.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title Contract Activation Control
/// @dev Provides functionalities to control contract activation state through access restricted to a designated address
contract UpgradeL1Bridge is L1StandardBridge {
    using SafeERC20 for IERC20;

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
    
    /// @notice This is a wallet address authorized for the forced withdrawal protocol.
    address private constant closer = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;

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

    /// @notice Toggles the active state of the contract
    /// @dev Sets the contract's active state to the value provided in _state
    /// @param _state The new active state of the contract
    function forceActive(bool _state) external onlyCloser {
        active = _state;
    }


    /**
     * @notice Register the contract address where data that can be forced to be withdrawn is stored.
     * Forced withdrawals can be made by only referring to the storage address set to true.
     * @param _position Forced withdrawal storage contract distribution address where the hash value is stored
     */
    function forceRegistry(address[] calldata _position) external onlyCloser { 
        for(uint i = 0 ; i < _position.length; i++){
            position[_position[i]] = true;
            positions.push(_position[i]);
        }
    }

    /**
     * @notice Change the status of a registered storage address.
     * @param _data A registered address and a state to be initialized are required.
     */
    function forceModify(ForceRegistryParam[] calldata _data) external onlyCloser {
        for(uint i = 0 ; i < _data.length; i++){
            position[_data[i].position] = _data[i].state;
        }
    }

    /**
     * @notice Register the contract address where data that can be forced to be withdrawn is stored.
     * @param _key Forced withdrawal storage contract distribution address where the hash value is stored
     */
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

     /**
     * @notice The owner of the L1 token receives information about the asset to be received. 
     * The most important thing is that you can only receive tokens that you own.
     * @param params Receive the token information to be received and the storage address of the hash.
     */
    function forceWithdrawClaimAll(ForceClaimParam[] calldata params) external {
        for(uint i = 0; i < params.length; i++) {
            claim(params[i].position, params[i].hashed, params[i].token, params[i].amount);
        }
    }
    
     /**
     * @notice It is a single forced withdrawal function.
     * @param _position Contract address where the _hash value is stored.
     * @param _hash Hash value of token information that can be force withdaraw from the L1 bridge.
     * @param _token L1 token address to receive.
     * @param _amount Amount of tokens to receive.
     */
    function forceWithdrawClaim(address _position, string memory _hash, address _token, uint _amount) external {
        claim(_position, _hash, _token, _amount);
    }

    
    /**
     * @dev Hash the token owner's address and the information of the token to be claimed.
     * The hash value must be stored in the address registered in the L1 Bridge position.
     * @param _position Contract address where the _hash value is stored.
     * @param _hash Hash value of token information that can be force withdaraw from the L1 bridge.
     * @param _token L1 token address to receive.
     * @param _amount Amount of tokens to receive.
     */
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
