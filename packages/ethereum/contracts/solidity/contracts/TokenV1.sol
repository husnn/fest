// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

import './HasSecondarySaleFees.sol';

struct Fee {
  address payable recipient;
  uint256 pct;
}

struct Token {
  uint256 dateCreated;
  address creator;
  uint256 supply;
  string uri;
}

contract TokenV1 is AccessControl, ERC1155, HasSecondarySaleFees {
  using ECDSA for bytes32;

  bytes internal constant EMPTY = '';

  bytes32 public constant ADMIN_ROLE = keccak256('ADMIN_ROLE');
  bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');

  string baseURI;

  uint256 private _tokenId = 0;
  mapping(uint256 => Token) _tokens;

  mapping(uint256 => Fee[]) _fees;

  mapping(bytes32 => bool) _approvalsExhausted;

  constructor(string memory baseUri) ERC1155(baseUri) {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

    _setupRole(ADMIN_ROLE, msg.sender);
    _setRoleAdmin(ADMIN_ROLE, DEFAULT_ADMIN_ROLE);

    _setupRole(MINTER_ROLE, msg.sender);
    _setRoleAdmin(MINTER_ROLE, ADMIN_ROLE);

    baseURI = baseUri;
  }

  modifier onlyAdminOrMinter() {
    require(
      hasRole(ADMIN_ROLE, msg.sender) || hasRole(MINTER_ROLE, msg.sender),
      'Permission denied.'
    );
    _;
  }

  modifier onlyAdminOrTokenOwner(address account) {
    require(
      msg.sender == account || hasRole(ADMIN_ROLE, msg.sender),
      'Permission denied.'
    );
    _;
  }

  function supportsInterface(bytes4 interfaceId)
    public
    view
    override(AccessControl, ERC1155, HasSecondarySaleFees)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }

  function setBaseURI(string memory uri_) public onlyRole(ADMIN_ROLE) {
    baseURI = uri_;
    super._setURI(uri_);
  }

  function uri(uint256 id) public view override returns (string memory) {
    return string(abi.encodePacked(baseURI, _tokens[id].uri));
  }

  function getMintHash(
    address creator,
    uint256 supply,
    string calldata uri_,
    uint256 expiry,
    uint256 salt
  ) public view returns (bytes32) {
    return
      keccak256(
        abi.encodePacked(address(this), creator, supply, uri_, expiry, salt)
      );
  }

  function get(uint256 id) public view returns (Token memory) {
    return _tokens[id];
  }

  event Minted(uint256 indexed id, Token token, Fee[] fees, string data);
  event RevokeMint(
    address operator,
    address creator,
    uint256 indexed supply,
    string uri
  );

  function mint(
    address creator,
    uint256 supply,
    string calldata uri_,
    Fee[] memory fees,
    string calldata data,
    uint256 expiry,
    uint256 salt,
    bytes calldata signature
  ) public {
    if (!hasRole(MINTER_ROLE, msg.sender)) {
      require(expiry > block.timestamp, 'Approval expired.');

      bytes32 mintHash = getMintHash(creator, supply, uri_, expiry, salt);
      require(!_approvalsExhausted[mintHash], 'Approval exhausted.');

      address recoveredAddress = mintHash.toEthSignedMessageHash().recover(
        signature
      );

      require(
        recoveredAddress != address(0) &&
          hasRole(MINTER_ROLE, recoveredAddress),
        'Invalid signature.'
      );

      _approvalsExhausted[mintHash] = true;
    }

    _tokenId++;

    super._mint(creator, _tokenId, supply, EMPTY);

    Token memory token = Token(block.timestamp, creator, supply, uri_);

    _tokens[_tokenId] = token;

    uint256 totalBps = 0;

    for (uint256 i = 0; i < fees.length; i++) {
      totalBps += fees[i].pct;

      if (totalBps <= 10**5) _fees[_tokenId].push(fees[i]);
    }

    emit Minted(_tokenId, token, _fees[_tokenId], data);
  }

  function revokeMintApproval(
    address creator,
    uint256 supply,
    string calldata uri_,
    uint256 expiry,
    uint256 salt
  ) public onlyAdminOrMinter {
    bytes32 mintHash = getMintHash(creator, supply, uri_, expiry, salt);
    require(!_approvalsExhausted[mintHash], 'Approval already exhausted.');

    _approvalsExhausted[mintHash] = true;

    emit RevokeMint(msg.sender, creator, supply, uri_);
  }

  function getFeeRecipients(uint256 id)
    public
    view
    override
    returns (address payable[] memory)
  {
    Fee[] memory fees = _fees[id];
    address payable[] memory result = new address payable[](fees.length);

    for (uint256 i = 0; i < fees.length; i++) {
      result[i] = fees[i].recipient;
    }

    return result;
  }

  function getFeeBps(uint256 id)
    public
    view
    override
    returns (uint256[] memory)
  {
    Fee[] memory fees = _fees[id];
    uint256[] memory result = new uint256[](fees.length);

    for (uint256 i = 0; i < fees.length; i++) {
      result[i] = fees[i].pct;
    }

    return result;
  }

  function burn(
    address account,
    uint256 id,
    uint256 amount
  ) public onlyAdminOrTokenOwner(account) {
    super._burn(account, id, amount);
  }

  function burnBatch(
    address account,
    uint256[] memory ids,
    uint256[] memory amounts
  ) public onlyAdminOrTokenOwner(account) {
    super._burnBatch(account, ids, amounts);
  }
}
