// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../openzeppelin/contracts/access/AccessControl.sol";
import "../openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../openzeppelin/contracts/security/Pausable.sol";

import "./MarketWalletV1.sol";
import "./HasSecondarySaleFees.sol";

enum TradeStatus { Active, Sold, Cancelled }

struct Trade {
  uint id;
  address seller;
  address token;
  uint tokenId;
  uint quantity;
  uint available;
  address currency;
  uint price;
  TradeStatus status;
}

contract MarketV1 is AccessControl, Pausable {
  using ECDSA for bytes32;

  bytes internal constant EMPTY = "";

  uint256 public buyerFeePct = 5000;
  uint256 public sellerFeePct = 5000;
  uint256 public hundredPct = 10**5;

  uint256 public maxTokenPrice = 10**6 * 1 ether;
  uint256 public maxTradeQuantity = 10**6;
  uint256 public minTokenPrice = hundredPct;

  mapping(bytes => uint[]) public tradeHistory;

  uint private _tradeId = 0;

  mapping(uint => Trade) private _trades;

  // seller => (currency => revenue)
  mapping(address => mapping(address => uint)) internal _earnings;

  // contract address => isAuthorized
  mapping(address => bool) internal _approvedTokens;
  uint private _approvedTokenCount = 0;

  // contract address => isAuthorized
  mapping(address => bool) internal _approvedCurrencies;
  uint private _approvedCurrenciesCount = 0;
  
  mapping(bytes32 => bool) private _approvalsExhausted;

  address internal _feeBeneficiary;

  MarketWalletV1 internal _wallet;

  event Sell(
    uint tradeId,
    address seller,
    address tokenContract,
    uint tokenId,
    uint quantity,
    address currency,
    uint price
  );
  
  event Buy(
    uint tradeId,
    address buyer,
    uint quantity
  );

  event Cancel(
    uint indexed tradeId,
    address operator
  );
  
  bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

  bytes4 private constant _INTERFACE_ID_FEES = 0xb7799584;

  constructor(MarketWalletV1 wallet) {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    
    _setupRole(ADMIN_ROLE, msg.sender);
    _setRoleAdmin(ADMIN_ROLE, DEFAULT_ADMIN_ROLE);

    _feeBeneficiary = msg.sender;
    _wallet = wallet;
  }
  
  function supportsInterface(bytes4 interfaceID) override(AccessControl)
    public view returns (bool) {
    return super.supportsInterface(interfaceID);
  }

  function get(uint tradeId) public view returns (Trade memory) {
    return _trades[tradeId];
  }

  function buy(uint tradeId, uint quantity) public whenNotPaused {
    Trade memory trade = _trades[tradeId];

    // Require trade is still open
    require(trade.status == TradeStatus.Active, "Trade is not open.");

    // Check quantity
    require(quantity <= trade.available, "Not enough tokens for sale.");

    // Require buyer to be different from seller
    require(msg.sender != trade.seller, "Seller cannot be buyer.");

    // Calculate prices
    uint subtotal = trade.price * quantity;

    IERC20 currency = IERC20(trade.currency);

    (uint sellerFee, uint buyerFee) = calculateMarketFees(subtotal);

    uint allowance = currency.allowance(msg.sender, address(this));
    require(allowance >= subtotal + buyerFee, "Allowance is too low.");

    // Deposit currency for escrow
    currency.transferFrom(
      msg.sender,
      address(this),
      subtotal + buyerFee
    );

    uint available = trade.available - quantity;
    _trades[_tradeId].available = available;

    if (available == 0)
      _trades[_tradeId].status = TradeStatus.Sold;

    uint sellerNet = payAfterFees(
      subtotal,
      sellerFee,
      buyerFee,
      trade.token,
      trade.tokenId,
      trade.currency
    );

    pay(trade.currency, trade.seller, sellerNet);

    _wallet.give(
      trade.token,
      msg.sender,
      trade.tokenId,
      quantity
    );

    emit Buy(
      trade.id,
      msg.sender,
      quantity
    );
  }

  function pay(address currency, address account, uint amount) internal {
    _earnings[account][currency] += amount;
  }

  function calculateMarketFees(uint subtotal)
    internal view returns (uint sellerFee, uint buyerFee) {
    buyerFee = (subtotal * buyerFeePct) / hundredPct;
    sellerFee = (subtotal * sellerFeePct) / hundredPct;
  }

  function payAfterFees(
    uint subtotal,
    uint sellerFee,
    uint buyerFee,
    address token,
    uint tokenId,
    address currency
  ) internal returns (uint sellerPay) {
    if (subtotal > sellerFee)
      subtotal = subtotal - sellerFee;
      sellerPay = subtotal;
    
    // Pay market fees
    pay(currency, _feeBeneficiary, sellerFee + buyerFee);

    if (!IERC165(token).supportsInterface(_INTERFACE_ID_FEES))
      return sellerPay;

    HasSecondarySaleFees tokenWithFees = HasSecondarySaleFees(token);

    address payable[] memory recipients =
      tokenWithFees.getFeeRecipients(tokenId);

    uint[] memory feeBps = tokenWithFees.getFeeBps(tokenId);

    for (uint i = 0; i < feeBps.length; i++) {
      if (sellerPay == 0) break;

      uint fee = (subtotal * feeBps[i]) / hundredPct;

      if (fee > sellerPay) {
        fee = sellerPay;
        sellerPay = 0;
      } else {
        sellerPay -= fee;
      }

      pay(currency, recipients[i], fee);
    }
  }

  function getSaleAuthorizationHash(
    address seller,
    address token,
    uint tokenId,
    uint quantity,
    address currency,
    uint price,
    uint expiry,
    uint salt
  ) public view returns (bytes32) {
    return keccak256(abi.encodePacked(
      address(this),
      seller,
      token,
      tokenId,
      quantity,
      currency,
      price,
      expiry,
      salt
    ));
  }

  function sell(
    address seller,
    address token,
    uint tokenId,
    uint quantity,
    address currency,
    uint price,
    uint expiry,
    uint salt,
    bytes calldata signature
  ) public whenNotPaused {
    require(price >= minTokenPrice, "Price is too low.");
    require(price <= maxTokenPrice, "Price is too high.");
    require(quantity <= maxTradeQuantity, "Quantity exceeds maximum.");

    require(_approvedTokens[token], "Token contract is not allowed.");
    require(_approvedCurrencies[currency], "Currency is not allowed.");

    if (!hasRole(ADMIN_ROLE, msg.sender)) {
      require(expiry > block.timestamp, "Approval expired.");

      bytes32 saleHash = getSaleAuthorizationHash(
        seller,
        token,
        tokenId,
        quantity,
        currency,
        price,
        expiry,
        salt
      );

      require(!_approvalsExhausted[saleHash], "Approval exhausted.");
      
      address recoveredAddress = saleHash
        .toEthSignedMessageHash()
        .recover(signature);
      
      require(
        recoveredAddress != address(0)
          && hasRole(ADMIN_ROLE, recoveredAddress),
        "Invalid signature."
      );

      _approvalsExhausted[saleHash] = true;
    }

    if (!IERC165(token).supportsInterface(type(IERC1155).interfaceId))
      quantity = 1;

    _wallet.take(
      token,
      seller,
      tokenId,
      quantity
    );

    // Create trade
    _tradeId++;

    Trade memory trade = Trade(
      _tradeId,
      seller,
      token,
      tokenId,
      quantity,
      quantity,
      currency,
      price,
      TradeStatus.Active
    );

    _trades[_tradeId] = trade;

    tradeHistory[
      abi.encodePacked(
        token,
        tokenId
      )
    ].push(_tradeId);

    emit Sell(
      _tradeId,
      seller,
      token,
      tokenId,
      quantity,
      currency,
      price
    );
  }

  function cancel(uint256 tradeId) public {
    Trade memory trade = _trades[tradeId];
    
    require(
      trade.status == TradeStatus.Active,
      "Only open trades can be closed."
    );

    require(
      msg.sender == trade.seller || hasRole(ADMIN_ROLE, msg.sender),
      "Only seller or admin can close the trade."
    );
    
    // Mark trade as cancelled
    _trades[tradeId].status = TradeStatus.Cancelled;

    _wallet.give(
      trade.token,
      msg.sender,
      trade.tokenId,
      trade.available
    );

    emit Cancel(
      tradeId,
      msg.sender
    );
  }

  function getBalance(address currency, address account) public view returns (uint) {
    return _earnings[account][currency];
  }

  function withdraw(address currency, uint amount) public {
    require(
      _earnings[msg.sender][currency] >= amount,
      "Insufficient balance to withdraw."
    );

    _earnings[msg.sender][currency] -= amount;

    IERC20(currency).transfer(msg.sender, amount);
  }

  function setFeeBeneficiary(address beneficiary) public onlyRole(DEFAULT_ADMIN_ROLE) {
    _feeBeneficiary = beneficiary;
  }

  function setTokenApproval(address token, bool isApproved) public onlyRole(ADMIN_ROLE) {
    _approvedTokens[token] = isApproved;
  }

  function setCurrencyApproval(address currency, bool isApproved) public onlyRole(ADMIN_ROLE) {
    _approvedCurrencies[currency] = isApproved;
  }
  
  function setMaxTokenPriceEther(uint256 price) public onlyRole(ADMIN_ROLE) {
    maxTokenPrice = price * 1 ether;
  }
  
  function setMaxTokenPriceWei(uint256 price) public onlyRole(ADMIN_ROLE) {
    maxTokenPrice = price;
  }
  
  function setMaxTradeQuantity(uint256 quantity) public onlyRole(ADMIN_ROLE) {
    maxTradeQuantity = quantity;
  }

  function setBuyerFeePct(uint256 pct) public onlyRole(ADMIN_ROLE) {
    require(pct <= hundredPct, "Fee cannot be higher than hundred percent.");
    buyerFeePct = pct;
  }
  
  function setSellerFeePct(uint256 pct) public onlyRole(ADMIN_ROLE) {
    require(pct <= hundredPct, "Fee cannot be higher than hundred percent.");
    sellerFeePct = pct;
  }
  
  function pause() public onlyRole(ADMIN_ROLE) {
    super._pause();
  }

  function resume() public onlyRole(ADMIN_ROLE) {
    super._unpause();
  }
}
