// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./HasSecondarySaleFees.sol";

struct Fee {
  address payable recipient;
  uint pct;
}

struct Token {
  uint dateCreated;
  address creator;
  uint supply;
}

contract TokenV1 is AccessControl, ERC1155, HasSecondarySaleFees {
  using ECDSA for bytes32;

  bytes internal constant EMPTY = "";

  bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

  uint private _tokenId = 0;
  mapping(uint => Token) _tokens;

  mapping(uint => Fee[]) _fees;

  mapping(bytes32 => bool) _approvalsExhausted;

  constructor(string memory uri) ERC1155(uri) {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    
    _setupRole(ADMIN_ROLE, msg.sender);
    _setRoleAdmin(ADMIN_ROLE, DEFAULT_ADMIN_ROLE);

    _setupRole(MINTER_ROLE, msg.sender);
    _setRoleAdmin(MINTER_ROLE, ADMIN_ROLE);
  }

  modifier onlyAdminOrMinter() {
    require(
      hasRole(ADMIN_ROLE, msg.sender) || hasRole(MINTER_ROLE, msg.sender),
      "Permission denied."
    );
    _;
  }
  
  modifier onlyAdminOrTokenOwner(address account) {
    require(
      msg.sender == account || hasRole(ADMIN_ROLE, msg.sender),
      "Permission denied."
    );
    _;
  }

  function supportsInterface(bytes4 interfaceId) public view override(
    AccessControl,
    ERC1155,
    HasSecondarySaleFees
  ) returns (bool) {
    return super.supportsInterface(interfaceId);
  }

  function setMetadataUri(string calldata uri)
    public
    onlyRole(ADMIN_ROLE)
  {
    super._setURI(uri);
  }

  function getMintHash(address creator, uint supply, uint expiry, uint salt) public view returns (bytes32) {
    return keccak256(abi.encodePacked(
      address(this),
      creator,
      supply,
      expiry,
      salt
    ));
  }
  
  function get(uint id) public view returns (Token memory) {
    return _tokens[id];
  }

  event Minted(uint256 indexed id, Token token, Fee[] fees, string data);
  event RevokeMint(address operator, address creator, uint256 indexed supply);

  function mint(
    address creator,
    uint supply,
    Fee[] calldata fees,
    string calldata data,
    uint expiry,
    uint salt,
    bytes calldata signature
  ) public {
    if (!hasRole(MINTER_ROLE, msg.sender)) {
      require(expiry > block.timestamp, "Approval expired.");

      bytes32 mintHash = getMintHash(creator, supply, expiry, salt);
      require(!_approvalsExhausted[mintHash], "Approval exhausted.");
      
      address recoveredAddress =
        mintHash.toEthSignedMessageHash().recover(signature);

      require(
        recoveredAddress != address(0)
          && hasRole(MINTER_ROLE, recoveredAddress),
        "Invalid signature."
      );

      _approvalsExhausted[mintHash] = true;
    }

    _tokenId++;

    super._mint(creator, _tokenId, supply, EMPTY);

    Token memory token = Token(
      block.timestamp,
      creator,
      supply
    );

    _tokens[_tokenId] = token;

    uint totalBps = 0;

    for (uint i = 0; i < fees.length; i++) {
      totalBps += fees[i].pct;

      if (totalBps <= 10**5)
        _fees[_tokenId].push(fees[i]);
    }

    emit Minted(_tokenId, token, _fees[_tokenId], data);
  }

  function revokeMintApproval(
    address creator,
    uint supply,
    uint expiry,
    uint salt
  ) public onlyAdminOrMinter {    
    bytes32 mintHash = getMintHash(creator, supply, expiry, salt);
    require(!_approvalsExhausted[mintHash], "Approval already exhausted.");

    _approvalsExhausted[mintHash] = true;

    emit RevokeMint(msg.sender, creator, supply);
  }

  function getFeeRecipients(uint256 id) override public view returns (address payable[] memory) {
    Fee[] memory fees = _fees[id];
    address payable[] memory result = new address payable[](fees.length);

    for (uint i = 0; i < fees.length; i++) {
      result[i] = fees[i].recipient;
    }

    return result;
  }

  function getFeeBps(uint256 id) override public view returns (uint[] memory) {
    Fee[] memory fees = _fees[id];
    uint[] memory result = new uint[](fees.length);

    for (uint i = 0; i < fees.length; i++) {
      result[i] = fees[i].pct;
    }

    return result;
  }

  function burn(address account, uint256 id, uint256 amount)
    public
    onlyAdminOrTokenOwner(account)
  {
    super._burn(account, id, amount);
  }

  function burnBatch(address account, uint256[] memory ids, uint256[] memory amounts)
    public
    onlyAdminOrTokenOwner(account)
  {
    super._burnBatch(account, ids, amounts);
  }
}