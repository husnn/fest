require('dotenv').config();

const Token = artifacts.require('TokenV1');
const sigUtil = require('eth-sig-util');
const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const { assert } = require('chai');

const Web3 = require('web3');

contract('Token', async (accounts) => {
  const DEFAULT_ADMIN_ROLE = Web3.utils.padLeft('0x0', 64);
  const ADMIN_ROLE = Web3.utils.keccak256('ADMIN_ROLE');
  const MINTER_ROLE = Web3.utils.keccak256('MINTER_ROLE');

  let TokenContract;

  before(async () => {
    TokenContract = await Token.deployed();

    console.log(accounts[0]);
  });

  describe('Supported interfaces', async () => {
    it('should support receiving ERC1155 tokens', async () => {
      const isERC1155Receiver = await TokenContract.supportsInterface(
        '0xd9b67a26'
      );
      assert.equal(
        isERC1155Receiver,
        true,
        'Receiving ERC1155 is not supported'
      );
    });

    it('should support secondary fees', async () => {
      const supportsSecondarySaleFees = await TokenContract.supportsInterface(
        '0xb7799584'
      );
      assert.equal(
        supportsSecondarySaleFees,
        true,
        'Secondary sale fees are not supported'
      );
    });

    it('should not support random interface id', async () => {
      const supportsAll = await TokenContract.supportsInterface('0x00');
      assert.equal(supportsAll, false, 'Seems to support all interface ids');
    });
  });

  describe('Access control', async () => {
    it('should have deployer as Default Admin', async () => {
      const result = await TokenContract.hasRole(
        DEFAULT_ADMIN_ROLE,
        accounts[0]
      );
      assert.equal(result, true, 'Deployer is not default admin');
    });

    it('should have Default Admin as admin of role Admin', async () => {
      const result = await TokenContract.getRoleAdmin(ADMIN_ROLE);
      assert.equal(
        result,
        DEFAULT_ADMIN_ROLE,
        'Default Admin is not admin of admins'
      );
    });

    it('should have deployer as Admin', async () => {
      const result = await TokenContract.hasRole(ADMIN_ROLE, accounts[0]);
      assert.equal(result, true, 'Deployer is not admin');
    });

    it('should have deployer as Minter', async () => {
      const result = await TokenContract.hasRole(MINTER_ROLE, accounts[0]);
      assert.equal(result, true, 'Deployer is not minter');
    });

    it('prevent granting Minter role to new account from non-admin', async () => {
      await expectRevert(
        TokenContract.grantRole(MINTER_ROLE, accounts[3], {
          from: accounts[2]
        }),
        'missing role'
      );
    });

    it('grant Minter role to new account from admin', async () => {
      const receipt = await TokenContract.grantRole(MINTER_ROLE, accounts[3], {
        from: accounts[0]
      });
      expectEvent(receipt, 'RoleGranted');
    });
  });

  describe('Mint new token', async () => {
    const supply = 10;
    let salt = 1234;

    let signature;

    let expiry = Math.floor(Date.now() / 1000) + 30; // Expire in 30 seconds

    it('sign mint from account with Minter role', async () => {
      const hash = await TokenContract.getMintHash(
        accounts[1],
        supply,
        '',
        expiry,
        salt
      );

      const privateKey = Buffer.from(process.env.DEPLOYER_PRIVATE_KEY, 'hex');

      signature = sigUtil.personalSign(privateKey, { data: hash });
    });

    it('prevent mint with different supply from signed hash', async () => {
      await expectRevert(
        TokenContract.mint(
          accounts[1],
          6455,
          '',
          [],
          '',
          expiry,
          salt,
          signature,
          { from: accounts[2] }
        ),
        'Invalid signature.'
      );
    });

    it('prevent mint with different salt from signed hash', async () => {
      await expectRevert(
        TokenContract.mint(
          accounts[1],
          supply,
          '',
          [],
          '',
          expiry,
          544564,
          signature,
          { from: accounts[2] }
        ),
        'Invalid signature.'
      );
    });

    it('prevent mint with different creator from signed hash', async () => {
      await expectRevert(
        TokenContract.mint(
          accounts[2],
          supply,
          '',
          [],
          '',
          expiry,
          salt,
          signature,
          { from: accounts[2] }
        ),
        'Invalid signature.'
      );
    });

    it('prevent mint with different expiry from signed hash', async () => {
      const expiry = Math.floor(Date.now() / 1000) + 100;

      await expectRevert(
        TokenContract.mint(
          accounts[2],
          supply,
          '',
          [],
          '',
          expiry,
          salt,
          signature,
          { from: accounts[2] }
        ),
        'Invalid signature.'
      );
    });

    it('prevent mint from expired hash', async () => {
      const expiry = Math.floor(Date.now() / 1000);

      await expectRevert(
        TokenContract.mint(
          accounts[2],
          supply,
          '',
          [],
          '',
          expiry,
          salt,
          signature,
          { from: accounts[2] }
        ),
        'Approval expired.'
      );
    });

    it('execute mint from a non-minter, non-creator account', async () => {
      const receipt = await TokenContract.mint(
        accounts[1],
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
    });

    it('should have correct token data', async () => {
      const token = await TokenContract.get(1);

      assert.equal(token.creator, accounts[1], `Creator is different.`);
      assert.equal(token.supply, supply, `Supply is not ${supply}`);
    });

    it('prevent mint with same hash', async () => {
      await expectRevert(
        TokenContract.mint(
          accounts[1],
          supply,
          '',
          [],
          '',
          expiry,
          salt,
          signature,
          { from: accounts[2] }
        ),
        'Approval exhausted.'
      );
    });

    it('prevent mint signed by non-minter', async () => {
      const hash = await TokenContract.getMintHash(
        accounts[1],
        supply,
        '',
        expiry,
        4321
      );

      const privateKey = Buffer.from(
        '2bc1dd2f4cdc608874d887b082700719949d858f179717da275b97c4cca16f8d',
        'hex'
      );

      signature = sigUtil.personalSign(privateKey, { data: hash });

      await expectRevert(
        TokenContract.mint(
          accounts[1],
          supply,
          '',
          [],
          '',
          expiry,
          4321,
          signature,
          { from: accounts[2] }
        ),
        'Invalid signature.'
      );
    });

    it('execute mint with invalid signature but sent from account with minter role', async () => {
      const receipt = await TokenContract.mint(
        accounts[1],
        supply,
        '',
        [],
        '',
        expiry,
        salt,
        signature,
        { from: accounts[0] }
      );

      expectEvent(receipt, 'Minted');
    });

    it('prevent cancelling by non-minter and non-admin account', async () => {
      await expectRevert(
        TokenContract.revokeMintApproval(
          accounts[5],
          supply,
          '',
          expiry,
          salt,
          { from: accounts[6] }
        ),
        'Permission denied.'
      );
    });

    it('cancel mint', async () => {
      let expiry = Math.floor(Date.now() / 1000) + 10;

      const hash = await TokenContract.getMintHash(
        accounts[5],
        supply,
        '',
        expiry,
        salt
      );

      const privateKey = Buffer.from(process.env.DEPLOYER_PRIVATE_KEY, 'hex');

      signature = sigUtil.personalSign(privateKey, { data: hash });

      const receipt = await TokenContract.revokeMintApproval(
        accounts[5],
        supply,
        '',
        expiry,
        salt,
        { from: accounts[3] }
      );
      expectEvent(receipt, 'RevokeMint');

      await expectRevert(
        TokenContract.mint(
          accounts[5],
          supply,
          '',
          [],
          '',
          expiry,
          salt,
          signature,
          { from: accounts[5] }
        ),
        'Approval exhausted.'
      );
    });
  });

  describe('Mint with fees', async () => {
    let tokenId;

    it('execute mint with fees', async () => {
      const receipt = await TokenContract.mint(
        accounts[1],
        10,
        '',
        [
          {
            recipient: accounts[2],
            pct: 1000
          },
          {
            recipient: accounts[3],
            pct: 1
          }
        ],
        '',
        0,
        0,
        0,
        { from: accounts[0] }
      );

      expectEvent(receipt, 'Minted');

      tokenId = receipt.logs[1].args.id;
    });

    it('can retrieve fee recipients', async () => {
      const recipients = await TokenContract.getFeeRecipients(tokenId);

      expect(recipients).to.eql([accounts[2], accounts[3]]);
    });

    it('can retrieve fee bps', async () => {
      const feeBps = await TokenContract.getFeeBps(tokenId);

      assert.equal(feeBps[0].toString(), '1000');
      assert.equal(feeBps[1].toString(), '1');
    });
  });

  describe('Burn tokens', async () => {
    it('prevent non-admin from burning token', async () => {
      await expectRevert(
        TokenContract.burn(accounts[1], 1, 1, { from: accounts[3] }),
        'Permission denied.'
      );
    });

    it('prevent random account from burning token', async () => {
      await expectRevert(
        TokenContract.burn(accounts[1], 1, 1, { from: accounts[5] }),
        'Permission denied.'
      );
    });

    it('allow burning token from admin account', async () => {
      const receipt = await TokenContract.burn(accounts[1], 1, 1, {
        from: accounts[0]
      });
      expectEvent(receipt, 'TransferSingle');
    });

    it('allow burning token from creator account', async () => {
      const receipt = await TokenContract.burn(accounts[1], 1, 1, {
        from: accounts[1]
      });
      expectEvent(receipt, 'TransferSingle');
    });
  });
});
