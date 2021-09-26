// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./MarketV1.sol";

struct Offer {
  address buyer;
  address seller;
  address token;
  uint tokenId;
  uint quantity;
  address currency;
  uint price;
  uint expiry;
}

contract OfferMarketV1 is MarketV1 {
  using ECDSA for bytes32;
 
  event AcceptOffer(
    address indexed seller,
    address indexed buyer,
    address token,
    address tokenId,
    uint quantity,
    address currency,
    uint price
  );

  event CancelOffer(
    address indexed sender,
    address token,
    address tokenId,
    uint quantity,
    address currency,
    uint price
  );

  mapping(bytes32 => bool) private _cancelled;
  mapping(bytes32 => bool) private _completed;

  constructor(MarketWalletV1 wallet) MarketV1(wallet) {}

  function acceptOffer(Offer calldata offer, uint salt, bytes calldata signature) public {
    require(msg.sender == offer.seller, "Only seller can accept offer.");

    require(_approvedTokens[offer.token], "Token contract is not allowed.");
    require(_approvedCurrencies[offer.currency], "Currency is not allowed.");
    
    require(offer.expiry > block.timestamp, "Offer is expired.");

    bytes32 offerHash = getOfferHash(offer, salt);

    require(
      !_cancelled[offerHash] && !_completed[offerHash],
      "Offer has been fulfilled or cancelled."
    );
    
    address recoveredAddress = offerHash
      .toEthSignedMessageHash()
      .recover(signature);

    require(
      recoveredAddress == offer.buyer,
      "Offer needs to be signed by the buyer."
    );

    require(offer.price >= minTokenPrice, "Price is too low.");

    (uint sellerFee, uint buyerFee) = calculateMarketFees(offer.price);

    // require(
    //   IERC20(offer.currency).allowance(
    //     offer.buyer,
    //     address(this)
    //   ) >= offer.price + buyerFee,
    //   "Insufficient transfer allowance."
    // );

    _completed[offerHash] = true;
    
    _wallet.take(
      offer.token,
      msg.sender,
      offer.tokenId,
      offer.quantity
    );

    IERC20(offer.currency).transferFrom(
      offer.buyer,
      address(this),
      offer.price + buyerFee
    );

    exchange(
      offer.seller,
      offer.buyer,
      offer.currency,
      offer.price,
      MarketFees(
        buyerFee,
        sellerFee
      ),
      TokenOrder(
        offer.token,
        offer.tokenId,
        offer.quantity
      )
    );
  }

  function getOfferHash(Offer calldata offer, uint salt) public view returns (bytes32) {
    return keccak256(abi.encodePacked(
      address(this),
      offer.buyer,
      offer.seller,
      offer.token,
      offer.tokenId,
      offer.quantity,
      offer.currency,
      offer.price,
      offer.expiry,
      salt
    ));
  }

  // Only offer maker and market owner can cancel
  function cancelOffer(Offer calldata offer, uint nonce, bytes calldata signature) public {
    bytes32 offerHash = getOfferHash(offer, nonce);

    require(!_completed[offerHash], "Offer has already been fulfilled.");
    require(!_cancelled[offerHash], "Offer has already been cancelled.");

    require(msg.sender == offerHash.recover(signature) || hasRole(ADMIN_ROLE, msg.sender));
    
    _cancelled[offerHash] = true;
  }
}