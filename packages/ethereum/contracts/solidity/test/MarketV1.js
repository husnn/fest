require('dotenv').config();

const Token = artifacts.require('TokenV1');
const FAN = artifacts.require('FAN');

const MarketWallet = artifacts.require('MarketWalletV1');
const OfferMarket = artifacts.require('OfferMarketV1');

const sigUtil = require('eth-sig-util');
const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const { assert } = require('chai');

const Web3 = require('web3');

contract('MarketV1', async (accounts) => {
  const TokenContract = await Token.deployed();
  const FANContract = await FAN.deployed();
  const WalletContract = await MarketWallet.deployed();
  const MarketContract = await OfferMarket.deployed();

  const ADMIN_ROLE = Web3.utils.keccak256('ADMIN_ROLE');

  let supply = 10;

  describe('List for sale', async () => {
    let salt = 1234;

    let signature;

    let expiry = Math.floor(Date.now() / 1000) + 30; // Expire in 30 seconds

    it('sign mint', async () => {
      const hash = await TokenContract.getMintHash(
        accounts[3],
        supply,
        '',
        expiry,
        salt
      );

      const privateKey = Buffer.from(process.env.DEPLOYER_PRIVATE_KEY, 'hex');

      signature = sigUtil.personalSign(privateKey, { data: hash });
    });

    let tokenId = 0;

    it('execute mint from a non-minter, non-creator account', async () => {
      const receipt = await TokenContract.mint(
        accounts[3],
        supply,
        '',
        [],
        '',
        expiry,
        salt,
        signature,
        { from: accounts[2] }
      );

      expectEvent(receipt, 'Minted');

      tokenId = receipt.logs[1].args.id.toString();
    });

    const seller = accounts[3];
    const token = TokenContract.address;
    const quantity = 1;
    const currency = FANContract.address;
    const price = 10 ** 5;

    expiry = Math.floor(Date.now() / 1000) + 30;
    salt = 65465;

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
      await TokenContract.setApprovalForAll(WalletContract.address, true, {
        from: seller
      });
    });

    const list = () =>
      MarketContract.listForSale(
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
          from: accounts[2]
        }
      );

    it('prevent listing unapproved token', async () => {
      await MarketContract.setTokenApproval(Token.address, false);
      await expectRevert(list(), 'Token contract is not allowed.');
    });

    it('approve token', async () => {
      await MarketContract.setTokenApproval(Token.address, true);
    });

    it('prevent listing with unapproved currency', async () => {
      await MarketContract.setCurrencyApproval(FAN.address, false);
      await expectRevert(list(), 'Currency is not allowed.');
    });

    it('approve currency', async () => {
      await MarketContract.setCurrencyApproval(FAN.address, true);
    });

    // Migration already assigns admin role.
    // it('prevent calling wallet contract without admin role', async () => {
    //   await expectRevert(list(), "AccessControl");
    // });

    it('grant admin role to market for wallet', async () => {
      await WalletContract.grantRole(ADMIN_ROLE, MarketContract.address);
    });

    let tradeId = 0;
    let buyer = accounts[1];

    it('list token for sale', async () => {
      const receipt = await list();
      expectEvent(receipt, 'ListForSale');

      tradeId = receipt.logs[0].args.tradeId.toString();

      const newTokenQuantityOwned = await TokenContract.balanceOf(
        seller,
        tokenId
      );

      assert.equal(
        newTokenQuantityOwned,
        supply - quantity,
        'Wrong seller token balance.'
      );
    });

    it('prevent buying excessive amount', async () => {
      await expectRevert(
        MarketContract.buy(tradeId, quantity + 1),
        'Not enough tokens for sale.'
      );
    });

    it('prevent buying if currency balance too low', async () => {
      await expectRevert(
        MarketContract.buy(tradeId, quantity),
        'Allowance is too low.'
      );
    });

    let buyerFee = (price / 100) * 5;
    let sellerFee = (price / 100) * 5;

    it('execute trade', async () => {
      const buyerBalanceInitial = price + 25000;

      await FANContract.transfer(buyer, buyerBalanceInitial, {
        from: accounts[0]
      });

      await FANContract.approve(MarketContract.address, buyerBalanceInitial, {
        from: buyer
      });

      const receipt = await MarketContract.buy(tradeId, quantity, {
        from: buyer
      });
      expectEvent(receipt, 'Buy');

      const buyerBalance = await FANContract.balanceOf(buyer);
      assert.equal(buyerBalance, buyerBalanceInitial - price - buyerFee);

      const sellerBalance = await MarketContract.getBalance(currency, seller);
      assert.equal(sellerBalance, price - sellerFee);
    });

    it('prevent buying closed trade', async () => {
      await expectRevert(
        MarketContract.buy(tradeId, quantity),
        'Trade is not open.'
      );
    });

    it('withdraw market fees to beneficiary', async () => {
      let marketBeneficiaryBalance = await MarketContract.getBalance(
        currency,
        accounts[0]
      );
      assert.equal(marketBeneficiaryBalance, buyerFee + sellerFee);

      await MarketContract.withdraw(currency, marketBeneficiaryBalance, {
        from: accounts[0]
      });

      marketBeneficiaryBalance = await MarketContract.getBalance(
        currency,
        accounts[0]
      );
      assert.equal(marketBeneficiaryBalance, 0);
    });

    it('prevent excessive withdrawing', async () => {
      await expectRevert(
        MarketContract.withdraw(currency, 1000, { from: accounts[0] }),
        'Insufficient balance to withdraw.'
      );
    });

    const quantityForSale = 5;

    describe('Cancel trade', async () => {
      salt = 54564;
      expiry = Math.floor(Date.now() / 1000) + 30;

      it('sign sale authorization', async () => {
        const hash = await MarketContract.getSaleAuthorizationHash(
          seller,
          token,
          tokenId,
          quantityForSale,
          currency,
          price,
          expiry,
          salt
        );

        const privateKey = Buffer.from(process.env.DEPLOYER_PRIVATE_KEY, 'hex');

        signature = sigUtil.personalSign(privateKey, { data: hash });
      });

      it('list token for sale', async () => {
        const receipt = await MarketContract.listForSale(
          seller,
          token,
          tokenId,
          quantityForSale,
          currency,
          price,
          expiry,
          salt,
          signature,
          {
            from: accounts[2]
          }
        );

        expectEvent(receipt, 'ListForSale');

        tradeId = receipt.logs[0].args.tradeId.toString();

        const newTokenQuantityOwned = await TokenContract.balanceOf(
          seller,
          tokenId
        );

        assert.equal(
          newTokenQuantityOwned,
          supply - quantity - quantityForSale,
          'Wrong seller token balance.'
        );
      });

      it('prevent non-seller, non-admin from cancelling trade', async () => {
        await expectRevert(
          MarketContract.cancel(tradeId, { from: accounts[5] }),
          'Only seller or admin can close the trade.'
        );
      });

      it('cancel trade and return tokens', async () => {
        const receipt = await MarketContract.cancel(tradeId, { from: seller });
        expectEvent(receipt, 'CancelListing');

        const tokensOwned = await TokenContract.balanceOf(seller, tokenId);

        assert.equal(
          tokensOwned,
          supply - quantity,
          'Wrong seller token balance.'
        );
      });
    });
  });
});
