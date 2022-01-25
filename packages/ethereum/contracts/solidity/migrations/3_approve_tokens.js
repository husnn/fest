const Token = artifacts.require('TokenV1');
const OfferMarket = artifacts.require('OfferMarketV1');

module.exports = async function (deployer) {
  const marketInstance = await OfferMarket.deployed();
  await marketInstance.setTokensApproval([Token.address], true);
}
