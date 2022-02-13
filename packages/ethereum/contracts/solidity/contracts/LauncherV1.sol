// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

import './CollectionV1.sol';

contract LauncherV1 is AccessControl {
  using ECDSA for bytes32;

  event Launched(
    address creator,
    string name,
    uint256 quantity,
    address instance,
    string message
  );

  bytes32 public constant ADMIN_ROLE = keccak256('ADMIN_ROLE');

  constructor() {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

    _setupRole(ADMIN_ROLE, msg.sender);
    _setRoleAdmin(ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
  }

  struct Approval {
    uint256 expiry;
    uint256 salt;
    bytes sig;
  }

  mapping(bytes32 => bool) private _approvalsExhausted;

  address[] public collections;

  function launch(
    address creator,
    string calldata collectionName,
    uint256 maxSupply,
    string calldata message,
    Approval calldata approval
  ) public {
    require(approval.expiry > block.timestamp, 'Approval expired.');

    bytes32 approvalHash = getApprovalHash(
      creator,
      collectionName,
      maxSupply,
      message,
      approval.expiry,
      approval.salt
    );
    require(!_approvalsExhausted[approvalHash], 'Approval exhausted.');

    address recoveredAddress = approvalHash.toEthSignedMessageHash().recover(
      approval.sig
    );

    require(
      recoveredAddress != address(0) && hasRole(ADMIN_ROLE, recoveredAddress),
      'Invalid signature.'
    );

    _approvalsExhausted[approvalHash] = true;

    address newCollection = address(
      new CollectionV1(creator, collectionName, maxSupply)
    );

    collections.push(newCollection);

    emit Launched(creator, collectionName, maxSupply, newCollection, message);
  }

  function getApprovalHash(
    address creator,
    string calldata collectionName,
    uint256 quantity,
    string calldata message,
    uint256 expiry,
    uint256 salt
  ) public view returns (bytes32) {
    return
      keccak256(
        abi.encodePacked(
          address(this),
          creator,
          collectionName,
          quantity,
          message,
          expiry,
          salt
        )
      );
  }

  function allCollections() public view returns (address[] memory) {
    return collections;
  }
}
