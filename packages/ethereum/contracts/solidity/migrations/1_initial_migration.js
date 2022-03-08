const Fest = artifacts.require("Fest");
const MarketV1 = artifacts.require("MarketV1");
const MarketWalletV1 = artifacts.require("MarketWalletV1");
const Migrations = artifacts.require("Migrations");
const TokenV1 = artifacts.require("TokenV1");

module.exports = function (deployer) {
  deployer.deploy(Migrations);

  deployer.deploy(Fest);
  deployer.deploy(TokenV1);

  deployer.deploy(MarketWalletV1).then((instance) => {
    deployer.deploy(MarketV1, instance.address);
  });
};
