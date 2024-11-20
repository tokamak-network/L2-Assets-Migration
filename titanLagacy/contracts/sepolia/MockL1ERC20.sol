// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockL1ERC20 is ERC20 {
    
    constructor(
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) {
        _mint(msg.sender, 1000000000000000000000000000);
    }

    // slither-disable-next-line external-function
    function mint(address _to, uint256 _amount) public virtual {
        _mint(_to, _amount);
    }

}
