const Token = artifacts.require('TokenV1');
const FAN = artifacts.require('FAN');

module.exports = async function (deployer) {
  deployer.deploy(Token, 'https://meta.fanbase.ly');
  deployer.deploy(FAN);
};
