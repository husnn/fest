// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

import './MarketWalletV1.sol';
import './HasSecondarySaleFees.sol';

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
  uint256 available;
  address currency;
  uint256 price;
  uint256 maxPurchasable;
  uint256 expiry;
  ListingStatus status;
}

struct MarketFees {
  uint256 buyer;
  uint256 seller;
}

struct TokenOrder {
  address token;
  uint256 id;
  uint256 quantity;
}

struct Approval {
  uint256 expiry;
  uint256 salt;
  bytes signature;
}

contract MarketV1 is AccessControl {
  using ECDSA for bytes32;

  bytes internal constant EMPTY = '';

  uint256 public buyerFeePct = 5000;
  uint256 public sellerFeePct = 5000;
  uint256 public hundredPct = 10**5;

  uint256 public maxListingQuantity = 10**6;
  uint256 public minTokenPrice = hundredPct;
  uint256 public maxTokenPrice = 10**6 * 1 ether;

  MarketWalletV1 internal _wallet;
  address internal _feeBeneficiary;

  uint256 private _listingId = 0;
  mapping(uint256 => Listing) private _listings;

  mapping(uint256 => mapping(address => uint256))
    public _listingPurchasesForBuyer;

  // contract address => isAuthorized
  mapping(address => bool) internal _approvedTokens;

  // contract address => isAuthorized
  mapping(address => bool) internal _approvedCurrencies;

  mapping(bytes32 => bool) private _approvalsExhausted;

  // seller => (currency => revenue)
  mapping(address => mapping(address => uint256)) internal _earnings;

  event ListForSale(
    uint256 listingId,
    address seller,
    address tokenContract,
    uint256 tokenId,
    uint256 quantity,
    address currency,
    uint256 price,
    uint256 maxPurchasable,
    uint256 expiry
  );

  event Trade(
    uint256 listingId,
    address buyer,
    address seller,
    uint256 quantity,
    address currency,
    uint256 price
  );

  event CancelListing(
    uint256 listingId,
    address operator,
    address tokenContract,
    uint256 tokenId,
    uint256 returned
  );

  event RoyaltyPayment(
    address token,
    uint256 tokenId,
    address beneficiary,
    address currency,
    uint256 amount
  );

  bytes32 public constant ADMIN_ROLE = keccak256('ADMIN_ROLE');

  bytes4 private constant _INTERFACE_ID_FEES = 0xb7799584;

  constructor(MarketWalletV1 wallet) {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

    _setupRole(ADMIN_ROLE, msg.sender);
    _setRoleAdmin(ADMIN_ROLE, DEFAULT_ADMIN_ROLE);

    _feeBeneficiary = msg.sender;
    _wallet = wallet;
  }

  function supportsInterface(bytes4 interfaceID)
    public
    view
    override(AccessControl)
    returns (bool)
  {
    return super.supportsInterface(interfaceID);
  }

  function get(uint256 listingId) public view returns (Listing memory) {
    return _listings[listingId];
  }

  function buy(uint256 listingId, uint256 quantity) public {
    Listing memory listing = _listings[listingId];

    // Require listing is still active
    require(listing.status == ListingStatus.Active, 'Listing is not active.');

    // Require quantity does not exceed supply
    require(quantity <= listing.available, 'Not enough tokens for sale.');

    // If listing has an expiry date,
    // ensure it hasn't already expired.
    if (listing.expiry > 0) {
      require(listing.expiry > block.timestamp, 'Listing has expired.');
    }

    // If there is a per-wallet quantity limit,
    // ensure it hasn't already been met.
    if (listing.maxPurchasable > 0) {
      require(
        _listingPurchasesForBuyer[listingId][msg.sender] + quantity <=
          listing.maxPurchasable,
        'Quantity exceeds maximum allowed per buyer.'
      );
    }

    uint256 subtotal = listing.price * quantity;
    (uint256 sellerFee, uint256 buyerFee) = calculateMarketFees(subtotal);

    // Deposit currency for escrow
    IERC20(listing.currency).transferFrom(
      msg.sender,
      address(this),
      subtotal + buyerFee
    );

    exchange(
      listing.seller,
      msg.sender,
      listing.currency,
      subtotal,
      MarketFees(buyerFee, sellerFee),
      TokenOrder(listing.token, listing.tokenId, quantity)
    );

    _listingPurchasesForBuyer[listingId][msg.sender] += quantity;

    uint256 available = listing.available - quantity;
    _listings[listingId].available = available;

    if (available == 0) {
      _listings[listingId].status = ListingStatus.Sold;
    }

    emit Trade(
      listingId,
      msg.sender,
      listing.seller,
      quantity,
      listing.currency,
      listing.price
    );
  }

  function exchange(
    address seller,
    address buyer,
    address currency,
    uint256 subtotal,
    MarketFees memory fees,
    TokenOrder memory order
  ) internal {
    uint256 sellerNet = payAfterFees(
      seller,
      currency,
      subtotal,
      fees.seller,
      fees.buyer,
      order.token,
      order.id
    );

    pay(seller, currency, sellerNet);

    _wallet.give(order.token, buyer, order.id, order.quantity);
  }

  function pay(
    address account,
    address currency,
    uint256 amount
  ) internal {
    _earnings[account][currency] += amount;
  }

  function calculateMarketFees(uint256 subtotal)
    internal
    view
    returns (uint256 sellerFee, uint256 buyerFee)
  {
    buyerFee = (subtotal * buyerFeePct) / hundredPct;
    sellerFee = (subtotal * sellerFeePct) / hundredPct;
  }

  function payAfterFees(
    address seller,
    address currency,
    uint256 subtotal,
    uint256 sellerFee,
    uint256 buyerFee,
    address token,
    uint256 tokenId
  ) internal returns (uint256 sellerPay) {
    if (subtotal > sellerFee) subtotal = subtotal - sellerFee;
    sellerPay = subtotal;

    // Pay market fees
    pay(_feeBeneficiary, currency, sellerFee + buyerFee);

    if (!IERC165(token).supportsInterface(_INTERFACE_ID_FEES)) return sellerPay;

    HasSecondarySaleFees tokenWithFees = HasSecondarySaleFees(token);

    address payable[] memory recipients = tokenWithFees.getFeeRecipients(
      tokenId
    );

    uint256[] memory feeBps = tokenWithFees.getFeeBps(tokenId);

    for (uint256 i = 0; i < feeBps.length; i++) {
      if (recipients[i] == seller) continue;
      if (sellerPay == 0) break;

      uint256 fee = (subtotal * feeBps[i]) / hundredPct;

      if (fee > sellerPay) {
        fee = sellerPay;
        sellerPay = 0;
      } else {
        sellerPay -= fee;
      }

      pay(recipients[i], currency, fee);

      emit RoyaltyPayment(token, tokenId, recipients[i], currency, fee);
    }
  }

  function getSaleAuthorizationHash(
    address seller,
    address token,
    uint256 tokenId,
    uint256 quantity,
    address currency,
    uint256 price,
    uint256 expiry,
    uint256 approvalExpiry,
    uint256 approvalSalt
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
          expiry,
          approvalExpiry,
          approvalSalt
        )
      );
  }

  function listForSale(
    address seller,
    address token,
    uint256 tokenId,
    uint256 quantity,
    address currency,
    uint256 price,
    uint256 maxPurchasable,
    uint256 expiry,
    Approval calldata approval
  ) public {
    require(
      price >= minTokenPrice &&
        price <= maxTokenPrice &&
        quantity <= maxListingQuantity,
      'Price or quantity falls outside allowed range.'
    );

    if (expiry > 0) {
      require(
        block.timestamp < expiry,
        'Listing expiry needs to be in the future.'
      );
    }

    require(
      _approvedTokens[token] && _approvedCurrencies[currency],
      'Token or currency contract is not approved.'
    );

    if (!hasRole(ADMIN_ROLE, msg.sender)) {
      require(approval.expiry > block.timestamp, 'Approval expired.');

      bytes32 saleHash = getSaleAuthorizationHash(
        seller,
        token,
        tokenId,
        quantity,
        currency,
        price,
        expiry,
        approval.expiry,
        approval.salt
      );

      require(!_approvalsExhausted[saleHash], 'Approval exhausted.');

      address recoveredAddress = saleHash.toEthSignedMessageHash().recover(
        approval.signature
      );

      require(
        recoveredAddress != address(0) && hasRole(ADMIN_ROLE, recoveredAddress),
        'Invalid signature.'
      );

      _approvalsExhausted[saleHash] = true;
    }

    if (!IERC165(token).supportsInterface(type(IERC1155).interfaceId))
      quantity = 1;

    _wallet.take(token, seller, tokenId, quantity);

    // Create listing
    _listingId++;

    Listing memory listing = Listing(
      _listingId,
      seller,
      token,
      tokenId,
      quantity,
      quantity,
      currency,
      price,
      maxPurchasable,
      expiry,
      ListingStatus.Active
    );

    _listings[_listingId] = listing;

    emit ListForSale(
      _listingId,
      seller,
      token,
      tokenId,
      quantity,
      currency,
      price,
      maxPurchasable,
      expiry
    );
  }

  function cancel(uint256 listingId) public {
    Listing memory listing = _listings[listingId];

    require(
      listing.status == ListingStatus.Active,
      'Only open listings can be closed.'
    );

    require(
      msg.sender == listing.seller || hasRole(ADMIN_ROLE, msg.sender),
      'Only seller or admin can close the listing.'
    );

    // Mark listing as cancelled
    _listings[listingId].status = ListingStatus.Cancelled;

    _wallet.give(
      listing.token,
      listing.seller,
      listing.tokenId,
      listing.available
    );

    emit CancelListing(
      listingId,
      msg.sender,
      listing.token,
      listing.tokenId,
      listing.available
    );
  }

  function getBalance(address currency, address account)
    public
    view
    returns (uint256)
  {
    return _earnings[account][currency];
  }

  function withdraw(address currency, uint256 amount) public {
    require(
      _earnings[msg.sender][currency] >= amount,
      'Insufficient balance to withdraw.'
    );

    _earnings[msg.sender][currency] -= amount;

    IERC20(currency).transfer(msg.sender, amount);
  }

  function listingPurchasesForBuyer(uint256 listingId, address buyer)
    public
    view
    returns (uint256)
  {
    return _listingPurchasesForBuyer[listingId][buyer];
  }

  function isTokenApproved(address token) public view returns (bool) {
    return _approvedTokens[token];
  }

  function isCurrencyApproved(address currency) public view returns (bool) {
    return _approvedCurrencies[currency];
  }

  function setTokensApproval(address[] calldata tokens, bool isApproved)
    public
    onlyRole(ADMIN_ROLE)
  {
    for (uint256 i = 0; i < tokens.length; i++) {
      _approvedTokens[tokens[i]] = isApproved;
    }
  }

  function setCurrenciesApproval(address[] calldata currencies, bool isApproved)
    public
    onlyRole(ADMIN_ROLE)
  {
    for (uint256 i = 0; i < currencies.length; i++) {
      _approvedCurrencies[currencies[i]] = isApproved;
    }
  }

  function setMaxTokenPriceEther(uint256 price) public onlyRole(ADMIN_ROLE) {
    maxTokenPrice = price * 1 ether;
  }

  function setMaxTokenPriceWei(uint256 price) public onlyRole(ADMIN_ROLE) {
    maxTokenPrice = price;
  }

  function setMaxListingQuantity(uint256 quantity) public onlyRole(ADMIN_ROLE) {
    maxListingQuantity = quantity;
  }

  function setBuyerFeePct(uint256 pct) public onlyRole(ADMIN_ROLE) {
    require(pct <= hundredPct, 'Fee cannot be higher than hundred percent.');
    buyerFeePct = pct;
  }

  function setSellerFeePct(uint256 pct) public onlyRole(ADMIN_ROLE) {
    require(pct <= hundredPct, 'Fee cannot be higher than hundred percent.');
    sellerFeePct = pct;
  }

  function setFeeBeneficiary(address beneficiary)
    public
    onlyRole(DEFAULT_ADMIN_ROLE)
  {
    _feeBeneficiary = beneficiary;
  }
}
