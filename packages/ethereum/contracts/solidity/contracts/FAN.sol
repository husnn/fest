// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FAN is ERC20 {
  constructor() ERC20("Fanbase Coin", "FAN") {
    _mint(msg.sender, (10**6) * (10**18));
  }
}
