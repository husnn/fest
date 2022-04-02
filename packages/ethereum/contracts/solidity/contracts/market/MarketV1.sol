// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

import "../errors.sol";
import "../interfaces/IERC2981.sol";

abstract contract MarketV1 is
  AccessControl,
  Pausable,
  ERC721Holder,
  ERC1155Holder
{
  using ECDSA for bytes32;

  struct Approval {
    uint256 nonce;
    uint256 expiry;
    bytes signature;
  }

  struct TokenTrade {
    address seller;
    address buyer;
    address token;
    uint256 tokenId;
    uint256 quantity;
    address currency;
    uint256 amount;
  }

  struct Fees {
    uint256 buyerPct;
    uint256 sellerPct;
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

  bytes internal constant EMPTY = "";

  // Recipient of market fees.
  address private _feeBeneficiary;

  // Wallet => (Currency => Earning amount)
  mapping(address => mapping(address => uint256))
    private _balances;

  bytes32 internal constant ADMIN_ROLE =
    keccak256("ADMIN_ROLE");

  constructor() {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

    _setupRole(ADMIN_ROLE, msg.sender);
    _setRoleAdmin(ADMIN_ROLE, DEFAULT_ADMIN_ROLE);

    _feeBeneficiary = msg.sender;
  }

  function supportsInterface(bytes4 interfaceID)
    public
    view
    override(AccessControl, ERC1155Receiver)
    returns (bool)
  {
    return super.supportsInterface(interfaceID);
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
   * @dev Transfer ownership of an ERC721/ERC1155 token.
   * @param from Currenct token owner.
   * @param to New token owner.
   * @param token ERC721/ERC1155 contract address.
   * @param id ID of the token to transfer ownership of.
   * @param quantity Number of tokens to transfer. Needs to be 1 for ERC721.
   */
  function _transfer(
    address from,
    address to,
    address token,
    uint256 id,
    uint256 quantity
  ) internal {
    if (
      IERC165(token).supportsInterface(
        type(IERC1155).interfaceId
      )
    ) {
      IERC1155(token).safeTransferFrom(
        from,
        to,
        id,
        quantity,
        EMPTY
      );
    } else {
      require(
        quantity == 1,
        "Quantity needs to be equal to one."
      );
      IERC721(token).safeTransferFrom(from, to, id);
    }
  }

  /**
   * @notice Calculate the fee amount to be charged on a trade.
   * @param amount Trade amount to base calculation on.
   * @param pct Fee percentage.
   * @return fee Fee amount.
   */
  function _calculateFee(uint256 amount, uint256 pct)
    private
    pure
    returns (uint256 fee)
  {
    // Don't charge a fee on free trades,
    // or if the fee percentage is zero.
    if (amount > 0 && pct > 0) {
      uint256 ff = amount * pct;

      if (ff < hundredPct) {
        fee = 1;
      } else {
        fee = ff / hundredPct;
      }
    }
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
    uint256 sellerPay = trade.amount;

    uint256 buyerFee;
    uint256 sellerFee;

    if (sellerPay > 0) {
      buyerFee = _calculateFee(sellerPay, fees.buyerPct);
      sellerFee = _calculateFee(sellerPay, fees.sellerPct);

      trade.amount += buyerFee;

      IERC20(trade.currency).transferFrom(
        trade.buyer,
        address(this),
        trade.amount
      );

      sellerPay -= sellerFee;
      sellerPay -= maybePayRoyalties(
        trade.token,
        trade.tokenId,
        trade.currency,
        sellerPay
      );

      _balances[trade.seller][trade.currency] += sellerPay;
      _balances[_feeBeneficiary][trade.currency] +=
        buyerFee +
        sellerFee;

      emit SalePayment(
        trade.seller,
        trade.currency,
        sellerPay
      );
    }

    _transfer(
      address(this),
      trade.buyer,
      trade.token,
      trade.tokenId,
      trade.quantity
    );

    emit Trade(
      tradeId,
      trade.seller,
      trade.buyer,
      trade.token,
      trade.tokenId,
      trade.quantity,
      trade.currency,
      trade.amount
    );
  }

  /**
   * @dev Check whether a token has any royalties, and allocate them in case it does.
   * @param token Address of the token contract containing royalty information.
   * @param tokenId Token ID for which to check royalties.
   * @param currency Contract address of the ERC20 token to make the payment in.
   * @param amount Amount to base the royalty calculation on.
   * @return Amount of royalty payment.
   */
  function maybePayRoyalties(
    address token,
    uint256 tokenId,
    address currency,
    uint256 amount
  ) internal returns (uint256) {
    // Check token contract supports the EIP-2981 standard.
    bool success = IERC165(token).supportsInterface(
      0x2a55205a
    );
    if (!success) return 0;

    (address receiver, uint256 royalty) = IERC2981(token)
      .royaltyInfo(tokenId, amount);

    if (royalty > 0) {
      if (royalty > amount) {
        royalty = amount;
      }

      // Pay owed royalties to recipient.
      _balances[receiver][currency] += royalty;

      emit RoyaltyPayment(
        token,
        tokenId,
        receiver,
        currency,
        royalty
      );
    }

    return royalty;
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
    onlyRole(DEFAULT_ADMIN_ROLE)
  {
    _feeBeneficiary = beneficiary;
  }

  /**
   * @notice Set whether certain transactions can be executed.
   * @param paused Boolean indicating whether to pause/unpause.
   */
  function setPaused(bool paused)
    external
    onlyRole(DEFAULT_ADMIN_ROLE)
  {
    if (paused) {
      _pause();
    } else {
      _unpause();
    }
  }
}
