// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { Lib_ForceWithdraw as st} from "./Lib_ForceWithdraw.sol";
import { Type } from "./Lib_ForceWithdraw.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract L1ForceWithdraw {
    using SafeERC20 for IERC20;

    // closer
    modifier onlyCloser() {
        if(msg.sender != st.closer) revert("Only Closer");
        _;
    }
    modifier paused() {
        if(st.load().active) revert("Paused L1StandardBridge");
        _;
    }

     function doActive() external onlyCloser {
        st.Data storage $ = st.load();
        $.active = !$.active;
    }

    function registry(Type.AssetsParam[] calldata _params) external onlyCloser {
        st.Data storage $ = st.load();
        for (uint i = 0; i < _params.length; i++) {
            if($.assets[_params[i].key] != address(0))
                $.assets[_params[i].key] = _params[i].claimer;
        }
    }
    
    function verifyRegistry(Type.AssetsParam[] calldata _params) external view returns (Type.AssetsParam memory) {
        st.Data storage $ = st.load();
        for (uint i = 0; i < _params.length; i++) {
            if($.assets[_params[i].key] == address(0))
                return _params[i];
        }
        return Type.AssetsParam(address(0), bytes32(0));
    }

    function editMigration(bytes32 _old, bytes32 _new, address claimer) external onlyCloser {
        st.Data storage $ = st.load();
        $.assets[_old] = address(0);
        $.assets[_new] = claimer; 
    }

    function migrattionClaim(address _token, uint _amount) external {
        _migrattionClaim(_token, _amount);
    }

    function migrattionClaimAll(Type.ClaimParam[] calldata _params) external {
        for(uint i = 0; i < _params.length; i++)
            _migrattionClaim(_params[i].token, _params[i].amount);
    }

    function generateKey(address _token, address _claimer, uint _amount) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(_token, _claimer, _amount));
    }

    function _migrattionClaim(address _token, uint _amount) internal {
        st.Data storage $ = st.load();
        address claimer = $.assets[keccak256(abi.encodePacked(_token, msg.sender, _amount))];
        if (claimer != msg.sender || claimer == address(0))
            revert("not claimer");
        
        $.assets[keccak256(abi.encodePacked(_token, msg.sender, _amount))] = address(0);

        if(_token == address(0)){
            (bool success, ) = msg.sender.call{ value: _amount }(new bytes(0));
            require(success, "TransferHelper::safeTransferETH: ETH transfer failed");
        }
        else 
            IERC20(_token).safeTransfer(msg.sender, _amount);
    }

  
}