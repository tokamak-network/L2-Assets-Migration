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
    mapping(bytes32 => address) private assets; // hased(L1Token, Claimer, amount) => Account
    
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

    function _forceWithdrawAll(ClaimParam calldata _target) internal  {
        if (_target.token == address(0)) {
            try this.callETH(_target) {
                emit ForceWithdraw(_target.index, _target.token, _target.to, _target.amount);
                
            } catch {
                console.log("ETH transfer failed");
            }
        } else {
            try this.callERC20(_target) {
                emit ForceWithdraw(_target.index, _target.token, _target.to, _target.amount);          
            } catch Error(string memory _err) {
                console.log("ERC20 transfer failed", _err);
            }
        } 
    }

    function callERC20(ClaimParam calldata _target) public  {
        if(address(this) != msg.sender)
            revert("Only this contract can call this function");

        IERC20(_target.token).safeTransfer(msg.sender, _target.amount);
    }

    function callETH(ClaimParam calldata _target) public  {
        if(address(this) != msg.sender)
            revert("Only this contract can call this function");

        (bool success, ) = _target.to.call{ value: _target.amount }(new bytes(0));
        require(success, "TransferHelper::safeTransferETH: ETH transfer failed");
    }
      
}