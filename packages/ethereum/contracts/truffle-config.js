require('dotenv').config();

const web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');

console.log(process.env.MNEMONIC);

module.exports = {
  contracts_directory: './solidity',
  contracts_build_directory: './build',
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*'
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC_TEST, process.env.PROVIDER_ROPSTEN)
      },
      network_id: 3,
      gas: 8000000,
      gasPrice: 20000000000
    },
    mumbai: {
      provider: () =>
        new HDWalletProvider(process.env.MNEMONIC, 'https://rpc-mumbai.maticvigil.com'),
        // new HDWalletProvider(process.env.MNEMONIC, process.env.PROVIDER_POLYGON_MUMBAI, 1),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },
  compilers: {
    solc: {
      version: '>=0.5.0 <0.9.0',
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
