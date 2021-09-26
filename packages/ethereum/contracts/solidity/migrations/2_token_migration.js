const Web3 = require('web3');

const Token = artifacts.require('TokenV1');
const FAN = artifacts.require('FAN');

const MarketWallet = artifacts.require('MarketWalletV1');
const OfferMarket = artifacts.require('OfferMarketV1');

const ADMIN_ROLE = Web3.utils.keccak256('ADMIN_ROLE');

module.exports = async function (deployer) {
  await deployer.deploy(FAN);
  await deployer.deploy(Token, 'ipfs://');

  await deployer.deploy(MarketWallet);
  await deployer.deploy(OfferMarket, MarketWallet.address);

  const walletInstance = await MarketWallet.deployed();
  await walletInstance.grantRole(ADMIN_ROLE, OfferMarket.address);

  const marketInstance = await OfferMarket.deployed();

  await marketInstance.setTokensApproval([Token.address], true);
  await marketInstance.setCurrenciesApproval([FAN.address], true);
};
