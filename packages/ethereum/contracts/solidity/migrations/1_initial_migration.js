const Fest = artifacts.require("Fest");
const ListingMarketV1 = artifacts.require("ListingMarketV1");
const Migrations = artifacts.require("Migrations");
const TokenV1 = artifacts.require("TokenV1");

module.exports = function (deployer) {
  deployer.deploy(Migrations);

  deployer.deploy(Fest);
  deployer.deploy(TokenV1);

  deployer.deploy(ListingMarketV1);
};
