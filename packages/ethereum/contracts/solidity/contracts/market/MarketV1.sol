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

  /**
   * @dev Emitted upon the exchange of assets.
   */
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

  /**
   * @dev Emitted when token royalties are allocated.
   */
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

  /**
   * @notice Revert if token contract is not approved,
   * and not any token can be used for trading.
   * @param token Token contract address.
   */
  modifier tokenAllowed(address token) {
    require(
      tokenApproved(token) || allowAllTokens,
      "Token contract not allowed."
    );
    _;
  }

  /**
   * @notice Revert if currency contract is not approved,
   * and not any currency can be used for trading.
   * @param currency Currency contract address.
   */
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

  // Basis pecentage point to charge the buyer on a trade.
  uint256 public buyerFeePct = 500;
  // Basis pecentage point to charge the seller on a trade.
  uint256 public sellerFeePct = 500;

  // Whether any token contract can be traded.
  bool public allowAllTokens = false;
  // Whether any currency contract can be used for trading.
  bool public allowAllCurrencies = false;

  // Token contract => Whether it's approved for trading.
  mapping(address => bool) private _approvedTokens;
  // Currency contract => Whether it's approved for trading.
  mapping(address => bool) private _approvedCurrencies;

  // Market wallet to use for new token holdings.
  IMarketWallet internal _activeWallet;
  // Recipient of market fees.
  address private _feeBeneficiary;

  // As we can upgrade the active market wallet contract, we need to
  // keep track of which contract to request a specific token from.
  //
  // Holding ID => Address of market wallet holding the corresponding token.
  mapping(uint256 => IMarketWallet) private _holdingWallet;

  // Wallet => (Currency => Earning amount)
  mapping(address => mapping(address => uint256))
    private _balances;

  constructor(IMarketWallet wallet) {
    _activeWallet = wallet;
    _feeBeneficiary = msg.sender;
  }

  /**
   * @notice Get the earned amount in a given currency.
   * @param owner Wallet address to enquire about.
   * @param currency ERC20 token address in which the balance has been earned.
   * @return _ ERC20 amount available.
   */
  function balance(address owner, address currency)
    external
    view
    returns (uint256)
  {
    return _balances[owner][currency];
  }

  /**
   * @notice Calculate fees charged for a given order amount.
   * @param subtotal Amount to calculate the fee for.
   * @return buyerFee Fee amount charged to buyer.
   * @return sellerFee Fee amount charged to seller.
   */
  function marketFees(uint256 subtotal)
    public
    view
    returns (uint256 buyerFee, uint256 sellerFee)
  {
    buyerFee = (subtotal * buyerFeePct) / hundredPct;
    sellerFee = (subtotal * sellerFeePct) / hundredPct;
  }

  /**
   * @notice Check whether a token is approved for trading.
   * @param token Token contract address.
   * @return _ Boolean indicating whether token is approved.
   */
  function tokenApproved(address token)
    public
    view
    returns (bool)
  {
    return _approvedTokens[token];
  }

  /**
   * @notice Check whether a currency can be used for trading.
   * @param currency Currency contract address.
   * @return _ Boolean indicating whether currency is approved.
   */
  function currencyApproved(address currency)
    public
    view
    returns (bool)
  {
    return _approvedCurrencies[currency];
  }

  /**
   * @dev Deposit token into escrow.
   * @param from Owner of the token.
   * @param token Token contract address.
   * @param tokenId ID of the token.
   * @param quantity Number of tokens to transfer (for standards like EIP-1155).
   * @param holdingId Unique ID of the holding.
   */
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

  /**
   * @dev Transfer token out of escrow.
   * @param to Receiving wallet.
   * @param token Token contract address.
   * @param tokenId ID of the token.
   * @param quantity Number of tokens to transfer (for standards like EIP-1155).
   * @param holdingId ID of the holding.
   */
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
   * @dev Perform trade:
    1. Take payment from buyer
    2. Transfer token to them 
    3. Pay any royalties
    4. Subtract market fees
    5. Allocate net amount to seller
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
   * @dev Check whether a token has any royalties, and allocate them in case it does.
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

  /**
   * @notice Set whether a list of tokens can be traded.
   * @param tokens Addresses of token contracts.
   * @param isApproved Boolean indicating whether to approve/disapprove.
   */
  function setTokenApproval(
    address[] calldata tokens,
    bool isApproved
  ) external onlyOwner {
    for (uint256 i = 0; i < tokens.length; i++) {
      _approvedTokens[tokens[i]] = isApproved;
    }
  }

  /**
   * @notice Set whether a list of currencies can be used for trading.
   * @param currencies Addresses of currency contracts.
   * @param isApproved Boolean indicating whether to approve/disapprove.
   */
  function setCurrencyApproval(
    address[] calldata currencies,
    bool isApproved
  ) external onlyOwner {
    for (uint256 i = 0; i < currencies.length; i++) {
      _approvedCurrencies[currencies[i]] = isApproved;
    }
  }

  /**
   * @notice Set fee percentage to charge the buyer on a trade.
   * @param pct Percentage basis point to charge.
   */
  function setBuyerFeePct(uint256 pct) external onlyOwner {
    require(pct <= hundredPct);
    buyerFeePct = pct;
  }

  /**
   * @notice Set fee percentage to charge the seller on a trade.
   * @param pct Percentage basis point to charge.
   */
  function setSellerFeePct(uint256 pct) external onlyOwner {
    require(pct <= hundredPct);
    sellerFeePct = pct;
  }

  /**
   * @notice Set the recipient of market fees.
   * @param beneficiary Receiving wallet address.
   */
  function setFeeBeneficiary(address beneficiary)
    external
    onlyOwner
  {
    _feeBeneficiary = beneficiary;
  }

  /**
   * @notice Set whether the trading of a token contract
   * is allowed regardless of its approval status.
   * @param allowed Boolean indicating whether to allow/disallow.
   */
  function setAllTokenAllowed(bool allowed)
    external
    onlyOwner
  {
    allowAllTokens = allowed;
  }

  /**
   * @notice Set whether a currency contract can be used
   * regardless of its approval status.
   * @param allowed Boolean indicating whether to allow/disallow.
   */
  function setAllCurrenciesAllowed(bool allowed)
    external
    onlyOwner
  {
    allowAllCurrencies = allowed;
  }

  /**
   * @notice Update the wallet contract address.
   * @param wallet Wallet contract address.
   */
  function upgradeWallet(address wallet)
    external
    onlyOwner
  {
    _activeWallet = IMarketWallet(wallet);
  }

  /**
   * @notice Set whether certain transactions can be executed.
   * @param paused Boolean indicating whether to pause/unpause.
   */
  function setPaused(bool paused) external onlyOwner {
    if (paused) {
      _pause();
    } else {
      _unpause();
    }
  }
}
