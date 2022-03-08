// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

import "./IMarketWallet.sol";

contract MarketWalletV1 is
  Ownable,
  IMarketWallet,
  ERC721Holder,
  ERC1155Holder
{
  enum AssetType {
    ERC721,
    ERC1155
  }

  bytes internal constant EMPTY = "";

  function supportsInterface(bytes4 interfaceID)
    public
    view
    override(ERC1155Receiver)
    returns (bool)
  {
    return super.supportsInterface(interfaceID);
  }

  function maxAssetQuantity(address asset, uint256 quantity)
    external
    view
    returns (uint256)
  {
    if (getAssetType(asset) == AssetType.ERC721) {
      return 1;
    }

    return quantity;
  }

  function take(
    address token,
    uint256 id,
    address from,
    uint256 quantity
  ) public onlyOwner {
    _transfer(
      getAssetType(token),
      token,
      from,
      address(this),
      id,
      quantity
    );
  }

  function give(
    address token,
    uint256 id,
    address to,
    uint256 quantity
  ) public onlyOwner {
    _transfer(
      getAssetType(token),
      token,
      address(this),
      to,
      id,
      quantity
    );
  }

  function getAssetType(address asset)
    public
    view
    returns (AssetType)
  {
    if (
      IERC165(asset).supportsInterface(
        type(IERC1155).interfaceId
      )
    ) {
      return AssetType.ERC1155;
    }

    return AssetType.ERC721;
  }

  function _transfer(
    AssetType assetType,
    address asset,
    address from,
    address to,
    uint256 id,
    uint256 quantity
  ) private {
    if (assetType == AssetType.ERC1155) {
      IERC1155(asset).safeTransferFrom(
        from,
        to,
        id,
        quantity,
        EMPTY
      );
    } else {
      IERC721(asset).safeTransferFrom(from, to, id);
    }
  }
}
