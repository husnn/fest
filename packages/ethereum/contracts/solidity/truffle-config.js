require('dotenv').config();

const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  contracts_build_directory: '../build',
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*'
    },
    ropsten: {
      provider: function () {
        return new HDWalletProvider(
          process.env.PRIVATE_KEY_ROPSTEN,
          process.env.PROVIDER_ROPSTEN
        );
      },
      network_id: 3,
      gas: 8000000,
      gasPrice: 10000000000
    },
    mumbai: {
      provider: () =>
        new HDWalletProvider(
          process.env.PRIVATE_KEY_TESTNET,
          process.env.PROVIDER_POLYGON_MUMBAI
        ),
      network_id: 80001,
      gasPrice: 2_000_000_000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    polygon: {
      provider: () =>
        new HDWalletProvider(
          process.env.PRIVATE_KEY_MAINNET,
          process.env.PROVIDER_POLYGON_MAINNET
        ),
      network_id: 137,
      gas: 8_000_000,
      gasPrice: 50_000_000_000,
      confirmations: 5,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },
  compilers: {
    solc: {
      version: '^0.8.0',
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
