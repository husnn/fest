// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "../interfaces/IERC2981.sol";
import "../errors.sol";

contract TokenV1 is AccessControl, ERC1155, IERC2981 {
  using ECDSA for bytes32;

  struct Token {
    uint256 id;
    uint256 dateCreated;
    address creator;
    uint256 supply;
    string metadataUri;
    uint256 royaltyPct;
  }

  event Mint(
    address indexed operator,
    uint256 indexed id,
    Token token,
    string data
  );

  event RevokeMint(
    address indexed operator,
    address indexed creator,
    uint256 supply,
    string data
  );

  modifier onlyMinter() {
    if (!hasRole(MINTER_ROLE, msg.sender)) {
      revert Unauthorized();
    }
    _;
  }

  string public constant name = "Fest Multi-Token";
  string public constant version = "1.0";

  uint256 public constant hundredPct = 10_000;

  bytes32 internal constant MINTER_ROLE =
    keccak256("MINTER_ROLE");
  bytes internal constant EMPTY = "";

  uint256 private _tokenId = 0;
  mapping(uint256 => Token) _tokens;

  mapping(bytes32 => bool) _approvalsExhausted;

  constructor() ERC1155("") {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

    _setupRole(MINTER_ROLE, msg.sender);
    _setRoleAdmin(MINTER_ROLE, DEFAULT_ADMIN_ROLE);
  }

  function uri(uint256 id)
    public
    view
    override
    returns (string memory)
  {
    return _tokens[id].metadataUri;
  }

  function get(uint256 id)
    public
    view
    returns (Token memory)
  {
    return _tokens[id];
  }

  function royaltyInfo(uint256 tokenId, uint256 salePrice)
    external
    view
    returns (address receiver, uint256 royaltyAmount)
  {
    receiver = _tokens[tokenId].creator;
    royaltyAmount =
      (salePrice * _tokens[tokenId].royaltyPct) /
      hundredPct;
  }

  function supportsInterface(bytes4 interfaceId)
    public
    view
    override(AccessControl, ERC1155, IERC165)
    returns (bool)
  {
    return
      interfaceId == type(IERC2981).interfaceId ||
      super.supportsInterface(interfaceId);
  }

  function mintHash(
    address creator,
    uint256 supply,
    string calldata metadataUri,
    uint256 royaltyPct,
    string calldata data,
    uint256 nonce,
    uint256 deadline
  ) public view returns (bytes32) {
    return
      keccak256(
        abi.encodePacked(
          address(this),
          creator,
          supply,
          metadataUri,
          royaltyPct,
          data,
          nonce,
          deadline
        )
      );
  }

  function mint(
    address creator,
    uint256 supply,
    string calldata metadataUri,
    uint256 royaltyPct,
    string calldata data,
    uint256 nonce,
    uint256 deadline,
    bytes memory signature
  ) public {
    if (deadline <= block.timestamp) {
      revert ApprovalExpired();
    }

    bytes32 mintHash_ = mintHash(
      creator,
      supply,
      metadataUri,
      royaltyPct,
      data,
      nonce,
      deadline
    );

    if (_approvalsExhausted[mintHash_]) {
      revert ApprovalExhausted();
    }

    address recoveredAddress = mintHash_
      .toEthSignedMessageHash()
      .recover(signature);

    if (
      recoveredAddress == address(0) ||
      !hasRole(MINTER_ROLE, recoveredAddress)
    ) {
      revert InvalidSignature();
    }

    _approvalsExhausted[mintHash_] = true;

    _tokenId++;

    super._mint(creator, _tokenId, supply, EMPTY);

    Token memory token = Token(
      _tokenId,
      block.timestamp,
      creator,
      supply,
      metadataUri,
      royaltyPct
    );

    _tokens[_tokenId] = token;

    emit Mint(msg.sender, _tokenId, token, data);
  }

  function revokeMintApproval(
    address creator,
    uint256 supply,
    string calldata metadataUri,
    uint256 royaltyPct,
    string calldata data,
    uint256 nonce,
    uint256 deadline
  ) public onlyMinter {
    bytes32 mintHash_ = mintHash(
      creator,
      supply,
      metadataUri,
      royaltyPct,
      data,
      nonce,
      deadline
    );

    if (_approvalsExhausted[mintHash_]) {
      revert ApprovalExhausted();
    }

    _approvalsExhausted[mintHash_] = true;

    emit RevokeMint(msg.sender, creator, supply, data);
  }
}
