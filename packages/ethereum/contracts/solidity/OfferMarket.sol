// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "./openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./openzeppelin/contracts/access/Ownable.sol";
import "./BaseMarket.sol";

struct Offer {
  address sender;
  address seller;
  IERC1155 token;
  uint tokenId;
  uint quantity;
  IERC20 currency;
  uint price;
  uint expiry;
}

contract OfferMarket is BaseMarket {
  using ECDSA for bytes32;

  event Accept(address indexed seller, address indexed buyer, address token, address tokenId, uint quantity, address currency, uint price);
  event Cancel(address indexed sender, address token, address tokenId, uint quantity, address currency, uint price);

  mapping(bytes32 => bool) private _cancelled;
  mapping(bytes32 => bool) private _completed;

  function acceptOffer(Offer calldata offer, uint nonce, bytes calldata signature) public {
    require(msg.sender == offer.seller, "Only seller can accept offer.");
    
    bytes32 offerHash = getOfferHashMsg(offer, nonce);

    require(offer.expiry > block.timestamp, "Offer is expired.");
    require(offerHash.recover(signature) == offer.sender, "Offer needs to be signed by the buyer.");
    require(!_cancelled[offerHash] && !_completed[offerHash], "Offer has been fulfilled or cancelled.");

    require(offer.price >= hundredPercent, "Price is too low.");
    require(offer.token.balanceOf(msg.sender, offer.tokenId) >= offer.quantity, "Seller has insufficient token balance.");

    _completed[offerHash] = true;

    uint buyerFee = (offer.price * buyerFeePct) / hundredPercent;

    require(offer.currency.allowance(
      offer.sender, address(this)) >= offer.price + buyerFee,
      "Buyer has insufficient balance."
    );

    uint sellerFee = (offer.price * sellerFeePct) / hundredPercent;

    uint sellerPay = 0;
    if (offer.price > sellerFee) sellerPay = offer.price - sellerFee;

    offer.token.safeTransferFrom(msg.sender, address(this), offer.tokenId, offer.quantity, EMPTY);

    offer.currency.transferFrom(offer.sender, address(this), offer.price + buyerFee);
    offer.currency.transfer(msg.sender, sellerPay);

    offer.token.safeTransferFrom(address(this), offer.sender, offer.tokenId, offer.quantity, EMPTY);
  }

  function getOfferHash(Offer calldata offer, uint nonce) public view returns (bytes32) {
    return keccak256(abi.encodePacked(
      address(this),
      offer.sender,
      offer.seller,
      offer.token,
      offer.tokenId,
      offer.quantity,
      offer.currency,
      offer.price,
      offer.expiry,
      nonce
    ));
  }

  function getOfferHashMsg(Offer calldata offer, uint nonce) public view returns (bytes32) {
    return getOfferHash(offer, nonce).toEthSignedMessageHash();
  }

  // Only offer maker and market owner can cancel
  function cancelOffer(Offer calldata offer, uint nonce, bytes calldata signature) public {
    bytes32 offerHash = getOfferHash(offer, nonce);

    require(!_completed[offerHash], "Offer has already been fulfilled.");
    require(!_cancelled[offerHash], "Offer has already been cancelled.");

    require(msg.sender == offerHash.recover(signature) || msg.sender == owner());
    _cancelled[offerHash] = true;
  }
  
  function supportsInterface(bytes4 interfaceID) override public pure returns (bool) {
    return interfaceID == 0x01ffc9a7  // ERC165
        || interfaceID == 0x4e2312e0; // ERC1155Receiver
  }
  
  function onERC1155Received(address, address, uint256, uint256, bytes calldata) override public pure returns(bytes4) {
    return 0xf23a6e61;
  }

  function onERC1155BatchReceived(address, address, uint256[] calldata, uint256[] calldata, bytes calldata) override public pure returns(bytes4) {}
}