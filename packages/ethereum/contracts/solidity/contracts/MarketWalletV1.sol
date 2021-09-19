// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

enum AssetType { ERC721, ERC1155 }

contract MarketWalletV1 is AccessControl, ERC721Holder, ERC1155Holder  {

  bytes internal constant EMPTY = "";
  
  bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

  constructor() {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    
    _setupRole(ADMIN_ROLE, msg.sender);
    _setRoleAdmin(ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
  }

  function supportsInterface(bytes4 interfaceID) override(AccessControl, ERC1155Receiver)
    public view returns (bool) {
    return super.supportsInterface(interfaceID);
  }

  function getAssetType(address asset) private view returns (AssetType) {
    if (IERC165(asset).supportsInterface(type(IERC1155).interfaceId)) {
      return AssetType.ERC1155;
    }

    return AssetType.ERC721;
  }

  function take(
    address token,
    address from,
    uint id,
    uint quantity
  ) public onlyRole(ADMIN_ROLE) {
    _transfer(getAssetType(token), token, from, address(this), id, quantity);
  }

  function give(
    address token,
    address to,
    uint id,
    uint quantity
  ) public onlyRole(ADMIN_ROLE) {
    _transfer(getAssetType(token), token, address(this), to, id, quantity);
  }
  
  function _transfer(
    AssetType assetType,
    address asset,
    address from,
    address to,
    uint id,
    uint quantity
  ) private {
    if (assetType == AssetType.ERC1155) {
      IERC1155(asset).safeTransferFrom(from, to, id, quantity, EMPTY);
    } else {
      IERC721(asset).safeTransferFrom(from, to, id);
    }
  }
}