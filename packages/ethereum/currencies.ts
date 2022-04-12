import { Currency } from '@fest/shared';

const polygon: { [network: string]: Currency[] } = {
  mainnet: [
    {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      contract: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
    },
    {
      name: 'Dai Stablecoin',
      symbol: 'DAI',
      decimals: 18,
      contract: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063'
    },
    {
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      contract: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f'
    },
    {
      name: 'Wrapped Matic',
      symbol: 'WMATIC',
      decimals: 18,
      contract: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
    }
  ],
  testnet: [
    {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      contract: '0x2058a9d7613eee744279e3856ef0eada5fcbaa7e'
    },
    {
      name: 'Dai Stablecoin',
      symbol: 'DAI',
      decimals: 18,
      contract: '0x001b3b4d0f3714ca98ba10f6042daebf0b1b7b6f'
    }
    // '0xf6ab4ba2c101ac9b120d6b9aeb211487bbd8058b', // WETH
    // '0xe583769738b6dd4e7caf8451050d1948be717679', // USDT
  ]
};

export const getForNetwork = (chainId: number): Currency[] => {
  switch (chainId) {
    case 137:
      return polygon.mainnet;
    case 80001:
      return polygon.testnet;
    default:
      return [];
  }
};
