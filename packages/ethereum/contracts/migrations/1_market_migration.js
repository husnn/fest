const Web3 = require('web3');

const MarketWallet = artifacts.require('MarketWalletV1');
const OfferMarket = artifacts.require('OfferMarketV1');

const ADMIN_ROLE = Web3.utils.keccak256('ADMIN_ROLE');

module.exports = async function (deployer) {
  await deployer.deploy(MarketWallet);
  await deployer.deploy(OfferMarket, MarketWallet.address);
   
  const wallet = await MarketWallet.deployed();
  await wallet.grantRole(ADMIN_ROLE, OfferMarket.address);
};
