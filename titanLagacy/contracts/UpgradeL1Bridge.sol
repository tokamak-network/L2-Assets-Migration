// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/* Interface Imports */
import { L1StandardBridge } from "./L1StandardBridge.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";    
import 'hardhat/console.sol';

// upgrade target L1StandardBridge
contract UpgradeL1Bridge is L1StandardBridge {
    using SafeERC20 for IERC20;

    event ForceWithdraw(
        bytes32 indexed _index,
        address indexed _token,
        address indexed _claimer,
        uint amount
    );

    struct ClaimParam {
        address token;
        address to;
        uint amount;
        bytes32 index; // hashed
    }

    // todo: Be sure to edit with an admin address!
    address private constant closer = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8; // force Owner

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
        bool success;
        if (_target.token == address(0)) {
            (success,) = _target.to.call{ value: _target.amount }(new bytes(0));
        } else {
            (success,) = _target.token.call(abi.encodeWithSelector(IERC20.transfer.selector, _target.to, _target.amount));
            // data = verifyCallResult(success,data,_target.token);
            // require(data.length == 0 || abi.decode(data, (bool)), "SafeERC20: ERC20 operation did not succeed");
        }
        if (success) {
            emit ForceWithdraw(_target.index, _target.token, _target.to, _target.amount);
        }
    }

    // function verifyCallResult(bool _success, bytes memory _data, address _target) internal returns(bytes memory){
    //     if (_success) {
    //         if (_data.length == 0) {
    //             // require(_target.code.length > 0, "Address: call to non-contract");
    //         }
    //         return _data;
    //     } else {
    //         _revert(_data, "verifyCallResult : Failed Transfer");
    //     }
    // }

    // function _revert(bytes memory returndata, string memory errorMessage) private pure {
    //     // Look for revert reason and bubble it up if present
    //     if (returndata.length > 0) {
    //         // The easiest way to bubble the revert reason is using memory via assembly
    //         /// @solidity memory-safe-assembly
    //         assembly {
    //             let returndata_size := mload(returndata)
    //             revert(add(32, returndata), returndata_size)
    //         }
    //     } else {
    //         revert(errorMessage);
    //     }
    // }

}

// 0. 오프체인 수집 결과에 의존 EOA만, 컨트랙트는 제외됩니다.  
// 1. 일반적이지 않는 표준 함수의 구현인가  ERC20 
// 2. 트랜잭션의 실패여부 확인  --> 잔액부족, 네트워크 환경, 함수 로직 문제 등 