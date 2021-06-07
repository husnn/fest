// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "./openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "./openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./openzeppelin/contracts/security/Pausable.sol";
import "./openzeppelin/contracts/access/Ownable.sol";
import "./HasSecondarySaleFees.sol";

enum TradeStatus { Open, Sold, Cancelled }

struct Trade {
  uint id;
  address seller;
  IERC1155 token;
  uint tokenId;
  uint quantity;
  uint available;
  IERC20 currency;
  uint price;
  TradeStatus status;
}

abstract contract BaseMarket is Ownable, Pausable, IERC1155Receiver {
  using ECDSA for bytes32;

  bytes internal constant EMPTY = "";

  uint256 internal buyerFeePct = 5000;
  uint256 internal sellerFeePct = 5000;
  uint256 internal hundredPercent = 10**5;

  uint256 internal maxTokenPrice = 1000000 ether;
  uint256 internal maxTradeQuantity = 1000000;
  uint256 internal minTokenPrice = hundredPercent;

  uint private _tradeId = 0;
  mapping(uint => Trade) _trades;
  mapping(bytes32 => uint[]) _tokenToTrades;

  // seller => (currency => revenue)
  mapping(address => mapping(address => uint)) _earnings;

  // contract address => isAuthorized
  uint private _approvedTokenCount = 0;
  mapping(address => bool) _approvedTokens;

  // contract address => isAuthorized
  uint private _approvedCurrenciesCount = 0;
  mapping(address => bool) _approvedCurrencies;

  mapping(bytes32 => bool) private _cancelled;
  mapping(bytes32 => bool) private _completed;

  event Sell(uint indexed tradeId, address indexed tokenContract, uint indexed tokenId, uint quantity, address currency, uint price);
  event Deposit(uint indexed tradeId, address indexed from, address tokenContract, uint tokenId, uint quantity);
  event Pay(uint indexed tradeId, address indexed payer, address currency, uint price);
  event Transfer(uint indexed tradeId, address indexed from, address indexed to, address asset, uint quantity);
  event Buy(uint indexed tradeId, address indexed buyer, address tokenContract, uint tokenId, uint quantity);
  event Sold(uint indexed tradeId, address tokenContract, uint tokenId);
  event Cancel(uint indexed tradeId, address operator);

  function buy(uint tradeId, uint quantity) public whenNotPaused {
    Trade memory trade = _trades[tradeId];

    // Require trade is still open
    require(trade.status == TradeStatus.Open, "Trade is not open.");

    // Check quantity
    require(quantity <= trade.available, "Not enough tokens for sale.");

    // Calculate prices
    uint subtotal = trade.price * quantity;

    uint buyerFee = (subtotal * buyerFeePct) / hundredPercent;
    uint sellerFee = (subtotal * sellerFeePct) / hundredPercent;

    require(trade.currency.allowance(msg.sender, address(this)) >= subtotal + buyerFee);

    // Deposit DAI for escrow
    trade.currency.transferFrom(msg.sender, address(this), subtotal + buyerFee);

    uint available = trade.available - quantity;
    _trades[_tradeId].available = available;

    if (available == 0)
      _trades[_tradeId].status = TradeStatus.Sold;
 
    // Send token to buyer
    trade.token.safeTransferFrom(address(this), msg.sender, trade.tokenId, quantity, EMPTY);

    // Pay seller
    uint sellerPay = 0;
    if (subtotal > sellerFee)
      sellerPay = subtotal - sellerFee;

    // Pay royalties
    // try HasSecondarySaleFees(address(trade.token)).getFeeRecipients(trade.tokenId) returns (address payable[] memory recipients) {
    //   try HasSecondarySaleFees(address(trade.token)).getFeeBps(trade.tokenId) returns (uint[] memory bps) {
    //     for (uint i = 0; i < bps.length; i++) {
    //       uint fee = (subtotal * bps[i]) / hundredPercent;
    //       if (fee <= sellerPay) {
    //         sellerPay -= fee;
    //         trade.currency.transfer(recipients[i], fee);
    //       }
    //     }
    //   } catch (bytes memory) {}
    // } catch (bytes memory) {}

    // Pay seller
    trade.currency.transfer(trade.seller, sellerPay);
    _earnings[trade.seller][address(trade.currency)] += sellerPay;
  }

  function sell(IERC1155 token, uint tokenId, uint quantity, IERC20 currency, uint price) public whenNotPaused {
    require(price >= minTokenPrice, "Price is too low.");
    require(price <= maxTokenPrice, "Price exceeds maximum.");
    require(quantity <= maxTradeQuantity, "Quantity exceeds maximum.");

    // Deposit token for escrow
    token.safeTransferFrom(msg.sender, address(this), tokenId, quantity, EMPTY);

    // Create trade
    _tradeId++;

    Trade memory trade = Trade(
      _tradeId,
      payable(msg.sender),
      token,
      tokenId,
      quantity,
      quantity,
      currency,
      price,
      TradeStatus.Open
    );

    _trades[_tradeId] = trade;
  }

      
  function cancel(uint256 tradeId) public {
    Trade memory trade = _trades[tradeId];
    
    require(trade.status == TradeStatus.Open, "Only open trades can be closed.");
    require(msg.sender == trade.seller || msg.sender == owner(), "Only seller can close the trade.");
    
    // Return token to seller
    trade.token.safeTransferFrom(msg.sender, trade.seller, trade.tokenId, trade.available, EMPTY);
    
    // Mark trade as cancelled
    _trades[tradeId].status = TradeStatus.Cancelled;
  }
  
  function setMaxTokenPriceEther(uint256 price) public onlyOwner {
    maxTokenPrice = price * 1 ether;
  }
  
  function setMaxTokenPriceWei(uint256 price) public onlyOwner {
    maxTokenPrice = price;
  }
  
  function setMaxTradeQuantity(uint256 quantity) public onlyOwner {
    maxTradeQuantity = quantity;
  }
  
  function getBuyerFeePercentage() public view returns (uint pct, uint hundred) {
    return (buyerFeePct, hundredPercent);
  }
  
  function getSellerFeePercentage() public view returns (uint pct, uint hundred) {
    return (sellerFeePct, hundredPercent);
  }

  function setBuyerFeePercentage(uint256 percentage) public onlyOwner {
    buyerFeePct = percentage * (hundredPercent / 100);
  }
  
  function setSellerFeePercentage(uint256 percentage) public onlyOwner {
    sellerFeePct = percentage * (hundredPercent / 100);
  }
  
  function pause() public onlyOwner {
    super._pause();
  }

  function resume() public onlyOwner {
    super._unpause();
  }
}
