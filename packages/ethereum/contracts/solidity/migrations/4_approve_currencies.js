const Fest = artifacts.require('Fest');
const OfferMarket = artifacts.require('OfferMarketV1');

const currencies = require('../../currencies');

module.exports = async function (deployer) {
  const chainId = await web3.eth.getChainId();
  const currenciesToApprove = currencies.getForNetwork(chainId);

  const marketInstance = await OfferMarket.deployed();
  await marketInstance.setCurrenciesApproval(
    [Fest.address, ...currenciesToApprove],
    true
  );
}
