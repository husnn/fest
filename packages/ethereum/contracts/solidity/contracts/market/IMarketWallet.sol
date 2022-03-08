// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMarketWallet {
  function maxAssetQuantity(address asset, uint256 quantity)
    external
    view
    returns (uint256);

  function take(
    address token,
    uint256 id,
    address from,
    uint256 quantity
  ) external;

  function give(
    address token,
    uint256 id,
    address to,
    uint256 quantity
  ) external;
}
