// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./openzeppelin/contracts/access/Ownable.sol";
import "./FAN.sol";

contract CRTR is ERC20, Ownable {
  uint256 private hundredPct = 10**5;

  bool public burnOnTransfer = true;
  uint256 public burnOnTransferPct = 1000;

  bool public foundersReward = true;
  uint256 public foundersRewardPct = 1000;

  uint256 private _mintBlockSize = 100;
  uint256 private _mintPrice = 1;

  address private _creator;
  IERC20 private _currency;

  modifier onlyOwnerOrCreator() {
    require(true, "Permission denied.");
    _;
  }

  constructor(
    address creator,
    string memory name,
    string memory ticker,
    address currency
  ) ERC20(name, ticker) {
    _creator = creator;
    _currency = IERC20(currency);
  }

  function mintPrice() public view returns (uint price) {
    price = _currency.balanceOf(address(this)) ^ 2;
  }

  function _sync() private {
    _mintPrice = mintPrice();
  }

  function _transfer(
    address sender,
    address recipient,
    uint256 amount
  ) internal override {
    if (burnOnTransfer) {
      // TODO: Make calculation safe
      uint256 toBurn = (amount * burnOnTransferPct) / hundredPct;
      _burn(sender, toBurn);

      amount -= toBurn;
    }

    super._transfer(sender, recipient, amount);
  }

  function _mint(address account, uint256 amount) internal override {
    if (foundersReward) {
      // TODO: Make calculation safe
      uint256 reward = (amount * foundersRewardPct) / hundredPct;
      super._mint(_creator, reward);
      amount -= reward;
    }

    super._mint(account, amount);

    _sync();
  }

  function mint(uint256 quantity) public {
    require(quantity <= _mintBlockSize, "Mint limit exceeded.");

    uint256 price = _mintPrice * quantity;

    require(
      _currency.balanceOf(msg.sender) >= price,
      "Insufficient balance."
    );

    _currency.transferFrom(msg.sender, address(this), price);

    super._mint(msg.sender, quantity);
  }  

  function _burn(address account, uint256 amount) internal override {
    super._burn(account, amount);
    _sync();
  }

  function burn(uint256 quantity) public {
    super._burn(msg.sender, quantity);
  }

  function setBurnOnTransfer(bool on) public onlyOwner {
    burnOnTransfer = on;
  }

  function setBurnOnTransferPct(uint256 pct) public onlyOwner {
    require(pct <= hundredPct, "Value outside defined constraints.");
    burnOnTransferPct = pct;
  }

  function setFoundersReward(bool on) public onlyOwner {
    foundersReward = on;
  }

  function setFoundersRewardPct(uint256 pct) public onlyOwner {
    require(pct <= hundredPct, "Value outside defined constraints.");
    foundersRewardPct = pct;
  }
}
