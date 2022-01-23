// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Fest is ERC20 {
  constructor() ERC20('Fest', 'FEST') {
    _mint(msg.sender, (10**9) * (10**18));
  }
}
