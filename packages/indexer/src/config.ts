export const serverConfig = {
  host: process.env.HOST || '0.0.0.0',
  port: parseInt(process.env.INDEXER_PORT || process.env.PORT) || 9000
};

export const ethConfig = {
  provider:
    process.env.ETH_PROVIDER_WSS ||
    process.env.ETH_PROVIDER ||
    'http://0.0.0.0:8545'
};

export const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379'
};
