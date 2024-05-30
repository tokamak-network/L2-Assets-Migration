// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/* Interface Imports */
import { L1StandardBridge } from "./L1Bridge.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "hardhat/console.sol";
// upgrade target L1StandardBridge
contract UpgradeL1BridgeD is L1StandardBridge {
    using SafeERC20 for IERC20;

    event Edited(bytes32 indexed oldHashed, bytes32 indexed newHashed, address indexed claimer);
    event ForceWithdraw(bytes32 indexed _index, address indexed _token, address indexed _claimer, uint _amount);

    struct ClaimParam {
        address token;
        address to; 
        uint amount;
        bytes32 index; // hashed
    }

    // WARNING: Be sure to edit with an admin address!
    address private constant closer = address(0); // msg.sender pauser same
    
    // closer
    modifier onlyCloser() {
        if (msg.sender != closer) revert("Only Closer");
        _;
    }
 
    function forceActive(bool _state) external onlyCloser {
        active = _state;
    }

    function forceWithdrawAll(ClaimParam[] calldata _target) external onlyCloser {
        for (uint i = 0; i < _target.length; i++) {
            _forceWithdrawAll(_target[i]);
        }
    }
    
    function _forceWithdrawAll(ClaimParam calldata _target) internal {
        if(_target.token == address(0)) {
            (bool success, ) = _target.to.call{ value: _target.amount }(new bytes(0));
            if(success) 
                emit ForceWithdraw(_target.index, _target.token, _target.to, _target.amount);
        }else{
            (bool success,) = _target.token.call(abi.encodeWithSelector(IERC20.transfer.selector, _target.to, _target.amount));
            if(success) 
                emit ForceWithdraw(_target.index, _target.token, _target.to, _target.amount);
        }
    }
}
 