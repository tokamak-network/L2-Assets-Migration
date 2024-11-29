// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockL1ERC20 is ERC20 {
    
    uint8 private _decimals;

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals_
    ) ERC20(_name, _symbol) {
        _mint(msg.sender, 1000000000000000000000000000);
        _decimals = _decimals_;
    }

    // slither-disable-next-line external-function
    function mint(address _to, uint256 _amount) public virtual {
        _mint(_to, _amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

}
