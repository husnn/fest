// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

struct Vesting {
  uint startDate;
  uint endDate;
  uint amount;
  uint amountPaid;
  uint duration;
  uint interval;
  bool exists;
}

contract Crowdsale {
  uint private constant HUNDRED_PERCENT = 10**5;
  uint private constant CLIFF_IN_DAYS = 180 days;

  uint public foundersPct = 20000;
  uint public teamPct = 5000;
  uint public communityPct = 5000;
  uint public investorsPct = 20000;
  uint public liquidityPct = 50000;

  mapping(address => Vesting) private _vested;
  mapping(address => uint) private _due;

  address private _coin;
  address private _currency;
  address private _exchange;

  uint private _reserve = 0;
  uint private totalSupply = 0;

  enum Stage { PRE_ICO, ICO }

  bool public icoStarted = false;

  uint private icoStart;
  uint private icoEnd;

  uint public preIcoMaxSupply;
  uint public icoMaxSupply;

  uint maxInvestmentSupply = 0;
  uint public investmentSold = 0;

  uint public icoSold = 0;
  uint public icoRaised = 0;

  mapping(address => uint) _preIcoBought;

  Stage private currentStage = Stage.PRE_ICO;
  
  constructor(address coin, address currency, address exchange) {
    _coin = coin;
    _currency = currency;
    _exchange = exchange;
  }

  function start(
    address founder,
    address team
  ) public {
    vest(founder, foundersPct, 180 days, 30 days);
    vest(team, teamPct, 180 days, 30 days);

    maxInvestmentSupply = (totalSupply * investorsPct) / HUNDRED_PERCENT;
    
    icoStarted = true;

    icoStart = block.timestamp + 30 days;
    icoEnd = icoStart + 30 days;
  }

  uint private icoPrice = 5; 

  function buy(uint quantity) public {
    require(quantity <= (maxInvestmentSupply - investmentSold));
    require(_preIcoBought[msg.sender] <= 1000);

    if (icoStart >= block.timestamp) {
      currentStage = Stage.ICO;
    }

    if (currentStage == Stage.ICO && block.timestamp > icoEnd) {
      currentStage = Stage.PRE_ICO;
    }

    uint price = quantity * 5;

    if (currentStage == Stage.ICO) {
      price = quantity * icoPrice;
    }

    require(IERC20(_currency).balanceOf(msg.sender) >= price);
    require(IERC20(_currency).allowance(msg.sender, address(this)) >= price);

    IERC20(_currency).transferFrom(msg.sender, address(this), price);

    _reserve += price;
    icoPrice = _reserve**2;
    
    if (currentStage == Stage.PRE_ICO) {
      _preIcoBought[msg.sender] += quantity;
    }

    IERC20(_coin).transfer(msg.sender, quantity);

    if (currentStage == Stage.ICO) {
      icoSold += quantity;
      icoRaised += price;
    }

    investmentSold += quantity;
  }

  function vest(address account, uint pct,uint durationInDays, uint intervalInDays) private {
    uint amount = (totalSupply * pct) / HUNDRED_PERCENT;

    uint startDate = block.timestamp;
    uint endDate = startDate + CLIFF_IN_DAYS + durationInDays;
    uint duration = endDate - startDate;

    _vested[account] = Vesting(
      startDate,
      endDate,
      amount,
      0,
      duration,
      intervalInDays,
      true
    );
  }

  function release() public {
    Vesting memory vesting = _vested[msg.sender];

    require(vesting.exists, "You have no vested amount.");

    uint toRelease = vesting.amount - vesting.amountPaid;

    if (block.timestamp <= vesting.endDate) {
      uint paydays = vesting.duration / vesting.interval; // 3 paydays - 90 days total - 30 day interval

      uint timeElapsed = block.timestamp - vesting.startDate; // 45 days elapsed

      uint pastPaydays = timeElapsed / vesting.interval; // 45 days / 3 = 1.5 past paydays;

      uint totalEarned = pastPaydays * (vesting.amount / paydays);

      require(totalEarned > vesting.amountPaid, "You cannot withdraw at this time.");
      
      toRelease = totalEarned - vesting.amountPaid;
    }

    _vested[msg.sender].amountPaid += toRelease;

    _due[msg.sender] += toRelease;
  }

  function withdraw() public {
    uint balance = _due[msg.sender];

    require(balance > 0, "You have nothing to withdraw.");
    _due[msg.sender] = 0;

    IERC20(_coin).transfer(msg.sender, balance);
  }

  function lockLiqudity() private {}
}