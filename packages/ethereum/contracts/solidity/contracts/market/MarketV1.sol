// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./IMarketWallet.sol";
import "../interfaces/IERC2981.sol";

abstract contract MarketV1 is Ownable, Pausable {
  using ECDSA for bytes32;

  struct Approval {
    uint256 nonce;
    uint256 expiry;
    bytes signature;
  }

  event Trade(
    uint256 sourceId,
    address indexed token,
    uint256 tokenId,
    address indexed seller,
    address indexed buyer,
    address currency,
    uint256 amount,
    uint256 quantity
  );

  event RoyaltyPayment(
    address indexed token,
    uint256 tokenId,
    address indexed receiver,
    address indexed currency,
    uint256 amount
  );

  error InsufficientBalance(
    uint256 desired,
    uint256 actual
  );

  modifier tokenAllowed(address token) {
    require(
      tokenApproved(token) || allowAllTokens,
      "Token contract not allowed."
    );
    _;
  }

  modifier currencyAllowed(address currency) {
    require(
      currencyApproved(currency) || allowAllCurrencies,
      "Currency contract not allowed."
    );
    _;
  }

  string public constant name = "Fest NFT Market";
  string public constant version = "1.0";

  uint256 public constant hundredPct = 10_000;

  uint256 public buyerFeePct = 500;
  uint256 public sellerFeePct = 500;

  IMarketWallet internal _activeWallet;
  address private _feeBeneficiary;

  mapping(uint256 => IMarketWallet) private _holdingWallet;

  mapping(address => bool) private _approvedTokens;
  mapping(address => bool) private _approvedCurrencies;

  bool public allowAllTokens = false;
  bool public allowAllCurrencies = false;

  constructor(IMarketWallet wallet) {
    _activeWallet = wallet;
    _feeBeneficiary = msg.sender;
  }

  mapping(address => mapping(address => uint256))
    private _balances;

  /**
   * @notice View own balance of a given currency.
   * @param owner Wallet address to enquire about.
   * @param currency ERC20 token address in which the balance has been earned.
   * @return The ERC20 amount available.
   */
  function balance(address owner, address currency)
    external
    view
    returns (uint256)
  {
    return _balances[owner][currency];
  }

  function marketFees(uint256 subtotal)
    public
    view
    returns (uint256 buyerFee, uint256 sellerFee)
  {
    buyerFee = (subtotal * buyerFeePct) / hundredPct;
    sellerFee = (subtotal * sellerFeePct) / hundredPct;
  }

  function tokenApproved(address token)
    public
    view
    returns (bool)
  {
    return _approvedTokens[token];
  }

  function currencyApproved(address currency)
    public
    view
    returns (bool)
  {
    return _approvedCurrencies[currency];
  }

  function _depositFrom(
    address from,
    address token,
    uint256 tokenId,
    uint256 quantity,
    uint256 holdingId
  ) internal {
    _holdingWallet[holdingId] = IMarketWallet(
      _activeWallet
    );
    _activeWallet.take(token, tokenId, from, quantity);
  }

  function _transferTo(
    address to,
    address token,
    uint256 tokenId,
    uint256 quantity,
    uint256 holdingId
  ) internal {
    _holdingWallet[holdingId].give(
      token,
      tokenId,
      to,
      quantity
    );
  }

  /**
   * @dev
   */
  function _trade(
    uint256 sourceId,
    address seller,
    address buyer,
    address token,
    uint256 tokenId,
    address currency,
    uint256 price,
    uint256 quantity
  ) internal {
    uint256 sellerPay = price * quantity;
    (uint256 buyerFee, uint256 sellerFee) = marketFees(
      sellerPay
    );

    uint256 amount = sellerPay + buyerFee;

    IERC20(currency).transferFrom(
      buyer,
      address(this),
      amount
    );

    _transferTo(buyer, token, tokenId, quantity, sourceId);

    sellerPay -=
      maybePayRoyalties(
        token,
        tokenId,
        currency,
        sellerPay
      ) -
      sellerFee;

    _balances[seller][currency] += sellerPay;

    emit Trade(
      sourceId,
      token,
      tokenId,
      seller,
      buyer,
      currency,
      amount,
      quantity
    );
  }

  /**
   * @notice Check whether a token has royalties, and pay them if it does.
   * @param token Address of the token contract containing royalty information.
   * @param tokenId Token ID for which to check royalties.
   * @param currency Contract address of the ERC20 token to make the payment in.
   * @param saleAmount Amount to base the royalty calculation on.
   * @return Amount of royalty payment.
   */
  function maybePayRoyalties(
    address token,
    uint256 tokenId,
    address currency,
    uint256 saleAmount
  ) internal returns (uint256) {
    // Check token contract supports the EIP-2981 standard.
    bool success = IERC165(token).supportsInterface(
      0x2a55205a
    );
    if (!success) return 0;

    (address receiver, uint256 amount) = IERC2981(token)
      .royaltyInfo(tokenId, saleAmount);

    if (amount > 0) {
      // Pay owed royalties to recipient.
      _balances[receiver][currency] += amount;

      emit RoyaltyPayment(
        token,
        tokenId,
        receiver,
        currency,
        amount
      );
    }

    return amount;
  }

  /**
   * @notice Withdraw own market earnings.
   * @param currency Address of the ERC20 token earned.
   * @param amount Amount to withdraw.
   */
  function withdraw(address currency, uint256 amount)
    external
    whenNotPaused
  {
    // Ensure the caller's balance is higher than
    // or equal to the amount requested.
    if (_balances[msg.sender][currency] < amount) {
      revert InsufficientBalance({
        desired: amount,
        actual: _balances[msg.sender][currency]
      });
    }

    // Update record of balance.
    _balances[msg.sender][currency] -= amount;

    // Transfer the ERC20 token.
    IERC20(currency).transfer(msg.sender, amount);
  }

  function setTokenApproval(
    address[] calldata tokens,
    bool isApproved
  ) external onlyOwner {
    for (uint256 i = 0; i < tokens.length; i++) {
      _approvedTokens[tokens[i]] = isApproved;
    }
  }

  function setCurrencyApproval(
    address[] calldata currencies,
    bool isApproved
  ) external onlyOwner {
    for (uint256 i = 0; i < currencies.length; i++) {
      _approvedCurrencies[currencies[i]] = isApproved;
    }
  }

  function setBuyerFeePct(uint256 pct) external onlyOwner {
    require(pct <= hundredPct);
    buyerFeePct = pct;
  }

  function setSellerFeePct(uint256 pct) external onlyOwner {
    require(pct <= hundredPct);
    sellerFeePct = pct;
  }

  function setFeeBeneficiary(address beneficiary)
    external
    onlyOwner
  {
    _feeBeneficiary = beneficiary;
  }

  function setAllTokenAllowed(bool allowed)
    external
    onlyOwner
  {
    allowAllTokens = allowed;
  }

  function setAllCurrenciesAllowed(bool allowed)
    external
    onlyOwner
  {
    allowAllCurrencies = allowed;
  }

  function upgradeWallet(address wallet)
    external
    onlyOwner
  {
    _activeWallet = IMarketWallet(wallet);
  }

  function setPaused(bool paused) external onlyOwner {
    if (paused) {
      _pause();
    } else {
      _unpause();
    }
  }
}
