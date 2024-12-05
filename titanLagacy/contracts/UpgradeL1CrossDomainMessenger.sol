// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { L1CrossDomainMessenger } from "./L1CrossDomainMessenger.sol";

contract UpgradeL1CrossDomainMessenger is L1CrossDomainMessenger {
    
    /**
    * unPause the contract
    */
    function unpause() external onlyOwner {
        _unpause();
    }

}
