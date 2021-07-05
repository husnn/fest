require('dotenv').config();

const Token = artifacts.require("TokenV1");
const FAN = artifacts.require("FAN");
const MarketWallet = artifacts.require("MarketWalletV1");
const OfferMarket = artifacts.require("OfferMarketV1");

const sigUtil = require('eth-sig-util');
const { expectEvent } = require('@openzeppelin/test-helpers');

const { assert } = require('chai');

const Web3 = require('web3');

contract('MarketV1', async (accounts) => {
  const TokenContract = await Token.deployed();
  const FANContract = await FAN.deployed();
  const WalletContract = await MarketWallet.deployed();
  const MarketContract = await OfferMarket.deployed();

  const ADMIN_ROLE = Web3.utils.keccak256('ADMIN_ROLE');
  
  describe('Sell token with fees', async () => {
    const tokenOwner = accounts[1];

    let supply = 10;
    let salt = 1234;

    let signature;

    let expiry = Math.floor(Date.now() / 1000) + 30; // Expire in 30 seconds

    const royalties = [
      {
        recipient: accounts[4],
        pct: 10000
      },
      {
        recipient: accounts[5],
        pct: 20000
      }
    ];

    it('sign mint', async () => {
      const hash = await TokenContract.getMintHash(
        tokenOwner,
        supply,
        expiry,
        salt
      );
  
      const privateKey = Buffer.from(process.env.DEPLOYER_PRIVATE_KEY, 'hex');
  
      signature = sigUtil.personalSign(privateKey, { data: hash });
    });

    let tokenId = 0;

    it('execute mint', async () => {
      const receipt = await TokenContract.mint(
        tokenOwner, supply, royalties, "", expiry, salt, signature, { from: tokenOwner }
      );
  
      expectEvent(receipt, 'Minted');

      tokenId = receipt.logs[1].args.id.toString();
    });

    const seller = tokenOwner;
    const token = TokenContract.address;
    const quantity = 1;
    const currency = FANContract.address;
    const price = 10**5;

    expiry = Math.floor(Date.now() / 1000) + 30;
    salt = 3245;

    it('sign sale authorization', async () => {
      const hash = await MarketContract.getSaleAuthorizationHash(
        seller,
        token,
        tokenId,
        quantity,
        currency,
        price,
        expiry,
        salt
      );
      
      const privateKey = Buffer.from(process.env.DEPLOYER_PRIVATE_KEY, 'hex');
  
      signature = sigUtil.personalSign(privateKey, { data: hash });
    });

    it('allow wallet to transfer token to itself', async () => {
      await TokenContract.setApprovalForAll(WalletContract.address, true, { from: seller });
    });

    it('approve token', async () => {
      await MarketContract.setTokenApproval(Token.address, true);
    });

    it('approve currency', async () => {
      await MarketContract.setCurrencyApproval(FAN.address, true);
    });

    it('grant admin role to market for wallet', async () => {
      await WalletContract.grantRole(ADMIN_ROLE, MarketContract.address);
    });

    let tradeId = 0;
    let buyer = accounts[2];

    it('list token for sale', async () => {
      const receipt = await MarketContract.listForSale(
        seller,
        token,
        tokenId,
        quantity,
        currency,
        price,
        expiry,
        salt,
        signature,
        {
          from: seller
        }
      );

      expectEvent(receipt, 'ListForSale');

      tradeId = receipt.logs[0].args.tradeId.toString();

      const newTokenQuantityOwned = await TokenContract.balanceOf(seller, tokenId);

      assert.equal(newTokenQuantityOwned, supply - quantity, 'Wrong seller token balance.');
    });

    let buyerFee = price / 100 * 5;
    let sellerFee = price / 100 * 5;

    let totalRoyalties = 0;

    for (const fee of royalties) {
      totalRoyalties += (price - sellerFee) * fee.pct / 100000;
    }
    
    it('execute trade', async () => {
      const buyerBalanceInitial = price + 25000;

      await FANContract.transfer(buyer, buyerBalanceInitial, { from: accounts[0] });

      await FANContract.approve(MarketContract.address, buyerBalanceInitial, { from: buyer });

      const receipt = await MarketContract.buy(tradeId, quantity, { from: buyer });
      expectEvent(receipt, 'Buy');

      const buyerBalance = await FANContract.balanceOf(buyer);
      assert.equal(buyerBalance, buyerBalanceInitial - price - buyerFee);
      
      const sellerBalance = await MarketContract.getBalance(currency, seller);
      assert.equal(sellerBalance, price - sellerFee - totalRoyalties);
    });

    it('withdraw royalties', async () => {
      let royalty1 = await MarketContract.getBalance(currency, royalties[0].recipient);
      assert.equal(royalty1, (price - sellerFee) * royalties[0].pct / 100000);
      
      let royalty2 = await MarketContract.getBalance(currency, royalties[1].recipient);
      assert.equal(royalty2, (price - sellerFee) * royalties[1].pct / 100000);

      await MarketContract.withdraw(currency, royalty1, { from: royalties[0].recipient });
      await MarketContract.withdraw(currency, royalty2, { from: royalties[1].recipient });

      const recipient1Balance = await MarketContract.getBalance(currency, royalties[0].recipient);
      assert.equal(recipient1Balance, 0);

      const recipient2Balance = await MarketContract.getBalance(currency, royalties[1].recipient);
      assert.equal(recipient2Balance, 0);
    });
  });
});