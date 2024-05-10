// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/* Interface Imports */
import { L1StandardBridge } from "sub/packages/tokamak/contracts/contracts/L1/messaging/L1StandardBridge.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// upgrade target L1StandardBridge
contract UpgradeL1Bridge is L1StandardBridge {
    using SafeERC20 for IERC20;

    event Edited(bytes32 indexed oldHashed, bytes32 indexed newHashed, address indexed claimer);
    event ForceWithdraw(bytes32 indexed hash, address _token, uint _amount, address indexed _claimer);

    struct AssetsParam {
        address claimer;
        bytes32 key;
    }
    struct ClaimParam {
        address token;
        uint amount;
    }

    // WARNING: Be sure to edit with an admin address!
    address private constant closer = address(0); // msg.sender pauser same
    mapping(bytes32 => address) private assets; // hased(L1Token, Claimer, amount) => Account
    bool public active = false;

    // closer
    modifier onlyCloser() {
        if (msg.sender != closer) revert("Only Closer");
        _;
    }
    modifier paused() {
        if (active) revert("Paused L1StandardBridge");
        _;
    }

     
    // todo : Need to check if the deposit should be blocked -> User error
    function forceActive() external onlyCloser {
        active = !active;
    }

    
    function registry(AssetsParam[] calldata _params) external onlyCloser {
        for (uint i = 0; i < _params.length; i++) {
            if (assets[_params[i].key] == address(0)) assets[_params[i].key] = _params[i].claimer;
        }
    }

    
    function isRegistry(
        AssetsParam[] calldata _params
    ) external view returns (AssetsParam[] memory) {
        AssetsParam[] memory result = new AssetsParam[](_params.length);
        for (uint i = 0; i < _params.length; i++) {
            if (assets[_params[i].key] == address(0))
                result[i] = AssetsParam(_params[i].claimer, _params[i].key);
        }
        return result;
    }

    
    function editRegistry(bytes32 _old, bytes32 _new, address _claimer) external onlyCloser {
        assets[_old] = address(0);
        assets[_new] = _claimer;
        emit Edited(_old , _new, _claimer);
    }

    
    function forceWithdraw(address _token, uint _amount) external {
        _forceWithdraw(_token, _amount);
    }

    
    function forceWithdrawAll(ClaimParam[] calldata _params) external {
        for (uint i = 0; i < _params.length; i++)
            _forceWithdraw(_params[i].token, _params[i].amount);
    }

    
    function generateKey(
        address _token,
        address _claimer,
        uint _amount
    ) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(_token, _claimer, _amount));
    }

    
    function _forceWithdraw(address _token, uint _amount) internal {
        bytes32 target = keccak256(abi.encodePacked(_token, msg.sender, _amount));
        address claimer = assets[target];
        if (claimer != msg.sender || claimer == address(0)) revert("not claimer");

        assets[target] = address(0);

        if (_token == address(0)) {
            (bool success, ) = msg.sender.call{ value: _amount }(new bytes(0));
            require(success, "TransferHelper::safeTransferETH: ETH transfer failed");
        } else IERC20(_token).safeTransfer(msg.sender, _amount);

        emit ForceWithdraw(target, _token, _amount, msg.sender);

    }
}