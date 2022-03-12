// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "./MarketV1.sol";
import "../interfaces/IERC2981.sol";

contract ListingMarketV1 is MarketV1 {
  using ECDSA for bytes32;

  enum ListingStatus {
    Active,
    Sold,
    Cancelled
  }

  struct Listing {
    uint256 id;
    address seller;
    address token;
    uint256 tokenId;
    uint256 quantity;
    address currency;
    uint256 price;
    Fees fees;
    uint256 available;
    uint256 maxPerBuyer;
    uint256 expiry;
    ListingStatus status;
  }

  event ListToken(
    uint256 listingId,
    address indexed seller,
    address indexed token,
    uint256 tokenId,
    address currency,
    uint256 price,
    uint256 quantity,
    uint256 maxPerBuyer,
    uint256 indexed expiry
  );

  event Cancel(
    uint256 listingId,
    address indexed seller,
    address indexed token,
    uint256 tokenId,
    uint256 returned
  );

  error InsufficientQuantity(
    uint256 desired,
    uint256 actual
  );
  error ListingInactive(uint256 id);
  error PurchaseQuantityExceeded(
    uint256 maxAllowed,
    uint256 purchased,
    uint256 desiredTotal
  );

  mapping(bytes32 => bool) private _approvalsExhausted;

  uint256 private _listingId = 0;
  mapping(uint256 => Listing) private _listings;

  mapping(address => mapping(uint256 => uint256))
    private _purchases;

  constructor() {}

  function buy(uint256 listingId, uint256 quantity)
    external
    whenNotPaused
  {
    Listing storage listing = _listings[listingId];

    if (listing.status != ListingStatus.Active) {
      revert ListingInactive({ id: listingId });
    }

    if (quantity > listing.available) {
      revert InsufficientQuantity({
        desired: quantity,
        actual: listing.available
      });
    }

    if (listing.expiry > 0) {
      if (listing.expiry <= block.timestamp) {
        revert ListingInactive({ id: listingId });
      }
    }

    uint256 desiredTotal = _purchases[msg.sender][
      listingId
    ] + quantity;

    if (listing.maxPerBuyer > 0) {
      if (desiredTotal > listing.maxPerBuyer) {
        revert PurchaseQuantityExceeded({
          maxAllowed: listing.maxPerBuyer,
          purchased: _purchases[msg.sender][listingId],
          desiredTotal: desiredTotal
        });
      }
    }

    _purchases[msg.sender][listing.id] += quantity;

    listing.available = listing.available - quantity;
    if (listing.available == 0) {
      listing.status = ListingStatus.Sold;
    }

    _trade(
      _listingId,
      TokenTrade(
        listing.seller,
        msg.sender,
        listing.token,
        listing.tokenId,
        quantity,
        listing.currency,
        quantity * listing.price
      ),
      listing.fees
    );
  }

  function get(uint256 listingId)
    external
    view
    returns (Listing memory)
  {
    return _listings[listingId];
  }

  function listingHash(
    address seller,
    address token,
    uint256 tokenId,
    uint256 quantity,
    address currency,
    uint256 price,
    Fees memory fees,
    uint256 maxPerBuyer,
    uint256 expiry,
    uint256 nonce,
    uint256 deadline
  ) public view returns (bytes32) {
    return
      keccak256(
        abi.encodePacked(
          address(this),
          seller,
          token,
          tokenId,
          quantity,
          currency,
          price,
          abi.encode(fees),
          maxPerBuyer,
          expiry,
          nonce,
          deadline
        )
      );
  }

  function listForSale(
    address token,
    uint256 tokenId,
    address seller,
    address currency,
    uint256 price,
    uint256 quantity,
    uint256 maxPerBuyer,
    uint256 expiry,
    Fees memory fees,
    Approval calldata approval
  ) external whenNotPaused {
    require(
      quantity > 0,
      "Quantity needs to be at least one."
    );

    if (expiry > 0) {
      require(
        block.timestamp < expiry,
        "Expiry needs to be in the future."
      );
    }

    _transfer(
      seller,
      address(this),
      token,
      tokenId,
      quantity
    );

    if (approval.expiry <= block.timestamp) {
      revert ApprovalExpired();
    }

    bytes32 listingHash_ = listingHash(
      seller,
      token,
      tokenId,
      quantity,
      currency,
      price,
      fees,
      maxPerBuyer,
      expiry,
      approval.nonce,
      approval.expiry
    );

    if (_approvalsExhausted[listingHash_]) {
      revert ApprovalExhausted();
    }

    address recoveredAddress = listingHash_
      .toEthSignedMessageHash()
      .recover(approval.signature);

    if (
      recoveredAddress == address(0) ||
      !hasRole(ADMIN_ROLE, recoveredAddress)
    ) {
      revert InvalidSignature();
    }

    _approvalsExhausted[listingHash_] = true;

    _listingId++;

    _listings[_listingId] = Listing(
      _listingId,
      seller,
      token,
      tokenId,
      quantity,
      currency,
      price,
      fees,
      quantity,
      maxPerBuyer,
      expiry,
      ListingStatus.Active
    );

    emit ListToken(
      _listingId,
      seller,
      token,
      tokenId,
      currency,
      price,
      quantity,
      maxPerBuyer,
      expiry
    );
  }

  function cancel(uint256 listingId)
    external
    whenNotPaused
  {
    Listing storage listing = _listings[listingId];

    if (listing.status != ListingStatus.Active) {
      revert ListingInactive({ id: listingId });
    }

    if (
      msg.sender != listing.seller &&
      !hasRole(ADMIN_ROLE, msg.sender)
    ) {
      revert Unauthorized();
    }

    listing.status = ListingStatus.Cancelled;

    _transfer(
      address(this),
      listing.seller,
      listing.token,
      listing.tokenId,
      listing.available
    );

    emit Cancel(
      listingId,
      listing.seller,
      listing.token,
      listing.tokenId,
      listing.available
    );
  }
}
