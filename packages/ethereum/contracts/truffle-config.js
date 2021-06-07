module.exports = {
  contracts_directory: './solidity',
  contracts_build_directory: './build',
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*'
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
