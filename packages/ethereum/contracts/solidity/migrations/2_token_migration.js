const Web3 = require('web3');
const fs = require('fs');

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
  
  let deployed = {};

  const outFile = 'deployed.json';
  const netId = await web3.eth.net.getId();

  fs.readFile(outFile, (err, data) => {
    if (!err) deployed = JSON.parse(data);

    deployed[netId] = {
      ...deployed[netId],
      Fest: Fest.address,
      Token: Token.address,
      OfferMarket: OfferMarket.address,
      MarketWallet: MarketWallet.address
    };
  
    fs.writeFileSync(outFile, JSON.stringify(deployed, null, 2), 'utf-8');
  });
};
