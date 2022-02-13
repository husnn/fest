// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

import './HasSecondarySaleFees.sol';

contract CollectionV1 is ERC721, HasSecondarySaleFees {
  address creator;
  uint256 maxSupply;

  address mintCurrency;
  uint256 mintPrice;

  constructor(
    address creator_,
    string memory name,
    uint256 maxSupply_,
    address mintCurrency_,
    uint256 mintPrice_
  ) ERC721(name, 'FST') {
    creator = creator_;
    maxSupply = maxSupply_;

    mintCurrency = mintCurrency_;
    mintPrice = mintPrice_;
  }

  uint256 private _id = 0;

  function mint() public payable {
    require(_id < maxSupply, 'Mint would exceed max supply.');
    _safeMint(msg.sender, _id++);

    if (mintCurrency == address(0)) {
      require(msg.value >= mintPrice);
    }

    Token memory token = Token(block.timestamp, creator, supply, uri_);

    _tokens[_tokenId] = token;

    uint256 totalBps = 0;

    for (uint256 i = 0; i < fees.length; i++) {
      totalBps += fees[i].pct;

      if (totalBps <= 10**5) _fees[_tokenId].push(fees[i]);
    }

    emit Minted(_tokenId, token, _fees[_tokenId], data);
  }

  function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721, HasSecondarySaleFees)
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
}
