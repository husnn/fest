// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./IMarketWallet.sol";
import "../errors.sol";
import "../interfaces/IERC2981.sol";

abstract contract MarketV1 is AccessControl, Pausable {
  using ECDSA for bytes32;

  struct Approval {
    uint256 nonce;
    uint256 expiry;
    bytes signature;
  }

  struct Fees {
    uint256 buyerPct;
    uint256 sellerPct;
  }

  struct TokenTrade {
    address seller;
    address buyer;
    address token;
    uint256 tokenId;
    uint256 quantity;
    address currency;
    uint256 price;
  }

  /**
   * @dev Emitted upon the exchange of assets.
   */
  event Trade(
    uint256 tradeId,
    address indexed seller,
    address indexed buyer,
    address indexed token,
    uint256 tokenId,
    uint256 quantity,
    address currency,
    uint256 amount
  );

  /**
   * @dev Emitted upon an amount being allocated to a seller.
   */
  event SalePayment(
    address indexed recipient,
    address indexed currency,
    uint256 amount
  );

  /**
   * @dev Emitted upon token royalties being allocated.
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

  string public constant name = "Fest NFT Market";
  string public constant version = "1.0";

  uint256 public constant hundredPct = 10_000;

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

  bytes32 internal constant ADMIN_ROLE =
    keccak256("ADMIN_ROLE");

  constructor(IMarketWallet wallet) {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

    _setupRole(ADMIN_ROLE, msg.sender);
    _setRoleAdmin(ADMIN_ROLE, DEFAULT_ADMIN_ROLE);

    _activeWallet = wallet;
    _feeBeneficiary = msg.sender;
  }

  modifier onlySuperAdmin() {
    if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
      revert Unauthorized();
    }
    _;
  }

  modifier onlyAdmin() {
    if (!hasRole(ADMIN_ROLE, msg.sender)) {
      revert Unauthorized();
    }
    _;
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
    _activeWallet.take(from, token, tokenId, quantity);
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
      to,
      token,
      tokenId,
      quantity
    );
  }

  /**
   * @notice Calculate buyer and seller fees charged for a trade.
   * @param subtotal Amount to calculate the fee for.
   * @param fees Percentages used for the calculation.
   * @return buyerFee Fee amount charged to buyer.
   * @return sellerFee Fee amount charged to seller.
   */
  function _calculateFeeAmounts(
    uint256 subtotal,
    Fees memory fees
  )
    private
    pure
    returns (uint256 buyerFee, uint256 sellerFee)
  {
    buyerFee = (subtotal * fees.buyerPct) / hundredPct;
    sellerFee = (subtotal * fees.sellerPct) / hundredPct;
  }

  /**
   * @dev Perform trade:
    1. Take payment from buyer
    2. Transfer token to them 
    3. Pay any royalties
    4. Subtract market fees
    5. Allocate net amount to seller
   * @param tradeId ID of the token holding.
   * @param trade Details of the trade.
   * @param fees Percentages charged to the buyer and seller.
   */
  function _trade(
    uint256 tradeId,
    TokenTrade memory trade,
    Fees memory fees
  ) internal {
    uint256 sellerPay = trade.price * trade.quantity;

    (
      uint256 buyerFee,
      uint256 sellerFee
    ) = _calculateFeeAmounts(sellerPay, fees);

    uint256 amount = sellerPay + buyerFee;

    IERC20(trade.currency).transferFrom(
      trade.buyer,
      address(this),
      amount
    );

    _transferTo(
      trade.buyer,
      trade.token,
      trade.tokenId,
      trade.quantity,
      tradeId
    );

    sellerPay -=
      maybePayRoyalties(
        trade.token,
        trade.tokenId,
        trade.currency,
        sellerPay
      ) -
      sellerFee;

    _balances[trade.seller][trade.currency] += sellerPay;

    emit SalePayment(
      trade.seller,
      trade.currency,
      sellerPay
    );

    emit Trade(
      tradeId,
      trade.seller,
      trade.buyer,
      trade.token,
      trade.tokenId,
      trade.quantity,
      trade.currency,
      amount
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
   * @notice Set the recipient of market fees.
   * @param beneficiary Receiving wallet address.
   */
  function setFeeBeneficiary(address beneficiary)
    external
    onlySuperAdmin
  {
    _feeBeneficiary = beneficiary;
  }

  /**
   * @notice Update the wallet contract address.
   * @param wallet Wallet contract address.
   */
  function upgradeWallet(address wallet)
    external
    onlySuperAdmin
  {
    _activeWallet = IMarketWallet(wallet);
  }

  /**
   * @notice Set whether certain transactions can be executed.
   * @param paused Boolean indicating whether to pause/unpause.
   */
  function setPaused(bool paused) external onlySuperAdmin {
    if (paused) {
      _pause();
    } else {
      _unpause();
    }
  }
}
