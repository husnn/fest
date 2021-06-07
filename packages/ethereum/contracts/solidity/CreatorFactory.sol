// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./CRTR.sol";

contract CreatorFactory {
  using ECDSA for bytes32;

  struct Coin {
    address creator;
    string name;
    string ticker;
  }

  mapping(string => address) private _tickers;
  mapping(address => Coin) private _coins;

  address[] public allCoins;

  address private _currency;

  constructor(address currency) {
    _currency = currency;
  }

  function authorizationHash(
    address creator,
    string calldata ticker,
    uint256 expiry
  ) public view returns (bytes32) {
    return keccak256(abi.encodePacked(
      address(this),
      creator,
      ticker,
      expiry
    ));
  }

  function create(
    string calldata name,
    string calldata ticker,
    uint256 expiry,
    address currency,
    bytes calldata sig
  ) public returns (address deployed) {
    require(expiry > block.timestamp, "Authorization expired.");
    require(_tickers[ticker] == address(0), "Ticker already exists.");

    bytes32 hashMsg = authorizationHash(msg.sender, ticker, expiry).toEthSignedMessageHash();
    address recoveredAddress = hashMsg.recover(sig);
    
    require(recoveredAddress != address(0) && recoveredAddress == msg.sender);

    bytes memory bytecode =
      abi.encodePacked(
        type(CRTR).creationCode,
        abi.encode(
            msg.sender,
            name,
            ticker,
            currency
        )
      );

    bytes32 salt = keccak256(abi.encodePacked(name, ticker));

    assembly {
      deployed := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
    }

    _tickers[ticker] = deployed;
    _coins[deployed] = Coin(msg.sender, name, ticker);

    allCoins.push(deployed);
  }
}
