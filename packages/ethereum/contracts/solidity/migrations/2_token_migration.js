const Web3 = require('web3');

const Token = artifacts.require('TokenV1');
const Fest = artifacts.require('Fest');

const MarketWallet = artifacts.require('MarketWalletV1');
const OfferMarket = artifacts.require('OfferMarketV1');

const currencies = require('../../currencies');

const ADMIN_ROLE = Web3.utils.keccak256('ADMIN_ROLE');

module.exports = async function (deployer) {
  await deployer.deploy(Fest);
  await deployer.deploy(Token, 'ipfs://');

  await deployer.deploy(MarketWallet);
  await deployer.deploy(OfferMarket, MarketWallet.address);

  const walletInstance = await MarketWallet.deployed();
  await walletInstance.grantRole(ADMIN_ROLE, OfferMarket.address);

  const marketInstance = await OfferMarket.deployed();

  await marketInstance.setTokensApproval([Token.address], true);

  const chainId = await web3.eth.getChainId();
  const currenciesToApprove = currencies.getForNetwork(chainId);

  await marketInstance.setCurrenciesApproval(
    [Fest.address, ...currenciesToApprove],
    true
  );
};
