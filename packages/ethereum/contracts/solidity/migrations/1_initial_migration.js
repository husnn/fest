const fs = require('fs');

const Migrations = artifacts.require("Migrations");
const Fest = artifacts.require("Fest");
const TokenV1 = artifacts.require("TokenV1");
const ListingMarketV1 = artifacts.require("ListingMarketV1");

module.exports = async function (deployer) {
  try {
    await Promise.all([
      deployer.deploy(Migrations),
      deployer.deploy(Fest),
      deployer.deploy(TokenV1),
      deployer.deploy(ListingMarketV1)
    ]);
  
    if (deployer.network === 'development') return;
  
    let deployed = {};
  
    const outFile = 'deployed.json';
    const netId = await web3.eth.net.getId();

    fs.readFile(outFile, (err, data) => {
      if (!err) deployed = JSON.parse(data);
  
      deployed[netId] = {
        ...deployed[netId],
        Fest: Fest.address,
        TokenV1: TokenV1.address,
        ListingMarketV1: ListingMarketV1.address
      };
    
      fs.writeFileSync(outFile, JSON.stringify(deployed, null, 2), 'utf-8');
    });
  } catch(err) {
    console.log(err)
  }
};
