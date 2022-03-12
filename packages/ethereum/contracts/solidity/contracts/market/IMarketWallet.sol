// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMarketWallet {
  function maxAssetQuantity(address asset, uint256 quantity)
    external
    view
    returns (uint256);

  function take(
    address from,
    address token,
    uint256 id,
    uint256 quantity
  ) external;

  function give(
    address to,
    address token,
    uint256 id,
    uint256 quantity
  ) external;
}
