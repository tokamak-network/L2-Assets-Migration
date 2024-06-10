// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {L1StandardBridge} from "./L1StandardBridge.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Contract Activation Control
/// @dev Provides functionalities to control contract activation state through access restricted to a designated address

contract UpgradeL1Bridge is L1StandardBridge {
    /// @title Claim Parameters for Token Transfers
    /// @dev Structure to hold parameters for claiming ERC20 or ETH
    /// @notice This structure is used to transfer both ERC20 tokens and native ETH in a transaction
    struct ClaimParam {
        /// @notice The token address for the ERC20 token; set to address zero for ETH
        /// @param token The address of the token contract (or zero for ETH)
        address token;
        /// @notice The destination address for the ERC20 or ETH transfer
        /// @param to The address receiving the ERC20 or ETH
        address to;
        /// @notice The amount of the ERC20 or ETH to transfer
        /// @param amount The amount of tokens or wei to send
        uint amount;
        /// @notice The unique identifier for the transfer request
        /// @param index The hashed index identifying the transfer
        bytes32 index;
    }

    /// @notice This is a wallet address authorized for the forced withdrawal protocol.
    address private constant closer =
        0x70997970C51812dc3A010C7d01b50e0d17dc79C8;

    /// @notice If the transfer is successful, the event below is executed.
    /// @dev event ForceWithdraw(bytes32 indexed _index,address indexed _token,address indexed _claimer,uint amount)
    bytes32 private constant EMIT_FORCE_WITHDRAW =
        0x3f8d5b1115561be924ebdce8f16fc7c9e2fe8c67b4db21016dc2a5d5e367c8d3;

    /// @notice Checks if the caller is the authorized 'closer' address
    /// @dev Modifier that allows function execution only by the designated 'closer'
    /// @custom:modifier onlyCloser Ensures only the designated closer can call the modified function
    modifier onlyCloser() {
        if (msg.sender != closer) revert("Only Closer");
        _;
    }

    /// @notice Toggles the active state of the contract
    /// @dev Sets the contract's active state to the value provided in _state
    /// @param _state The new active state of the contract
    function forceActive(bool _state) external onlyCloser {
        active = _state;
    }

    /// @notice Transfer ERC20 and ETH held by the bridge.
    /// @dev Failed transmissions are not processed separately and are retransmitted using the off-chain retransmission protocol.
    /// @param _t The address of the ERC20 contract
    function forceWithdrawAll(ClaimParam[] calldata _t) external onlyCloser {
        assembly {
            for {
                let i := 0
            } lt(i, _t.length) {
                i := add(i, 1)
            } {
                let off := add(_t.offset, mul(i, 0x80))
                let t := calldataload(off)
                let to := calldataload(add(off, 0x20))

                let r
                switch iszero(t)
                case 1 {
                    // ETH
                    r := call(
                        gas(),
                        to,
                        calldataload(add(off, 0x40)),
                        0,
                        0,
                        0,
                        0
                    )
                }
                default {
                    // ERC20
                    mstore(0x00, hex"a9059cbb")
                    mstore(0x04, to)
                    mstore(0x24, calldataload(add(off, 0x40)))
                    r := call(gas(), t, 0, 0x00, 0x44, 0, 0)
                }

                switch lt(0, r)
                case 1 {
                    log4(
                        add(off, 0x40),
                        0x20,
                        EMIT_FORCE_WITHDRAW,
                        calldataload(add(off, 0x60)),
                        t,
                        to
                    )
                }
            }
        }
    }
}
