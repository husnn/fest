const MarketWallet = artifacts.require('MarketWalletV1');
const OfferMarket = artifacts.require('OfferMarketV1');

module.exports = async function (deployer) {
  deployer.deploy(MarketWallet).then(async () => (
   deployer.deploy(OfferMarket, MarketWallet.address)
  ));
};
