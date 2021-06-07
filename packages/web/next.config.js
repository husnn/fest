const withTM = require('next-transpile-modules')([
  '@fanbase/shared',
  '@fanbase/eth-contracts',
  '@fanbase/eth-transactions'
]);

module.exports = withTM({
  webpack (config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });

    return config;
  }
});
