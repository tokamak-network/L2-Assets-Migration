// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

library Lib_ForceWithdraw {
    bytes32 constant FORCE_KEY = keccak256(abi.encodePacked("L1BridgeForceWithraw"));
    address constant internal closer = address(0);  // msg.sender pauser same 
    
    struct Data {
        mapping(bytes32 => address) assets; // hased(token, amount) => Account
        bool active; // msg.sender pauser same 
    }

    function load() internal pure returns (Data storage $) {
        bytes32 target = FORCE_KEY;
        assembly {
            $.slot := target
        }
    }    
}

library Type {
    struct AssetsParam {
        address claimer;
        bytes32 key;
    }
    struct ClaimParam {
        address token;
        uint amount;
    }
}