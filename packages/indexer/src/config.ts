import { PostgresConfig } from '@fanbase/postgres';

export const ethConfig = {
  provider:
    process.env.ETH_PROVIDER_WSS ||
    process.env.ETH_PROVIDER ||
    'http://localhost:8545'
};

export const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379'
};

export const postgresConfig: PostgresConfig = {
  uri: process.env.DATABASE_URL,
  host: process.env.PG_HOST || '127.0.0.1',
  port: parseInt(process.env.PG_PORT) || 5432,
  database: process.env.PG_DATABASE || 'postgres',
  username: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres'
};
