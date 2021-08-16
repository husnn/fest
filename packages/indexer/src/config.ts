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
  host: process.env.PG_HOST || process.env.RDS_HOSTNAME || '127.0.0.1',
  port: parseInt(process.env.PG_PORT || process.env.RDS_PORT) || 5432,
  database: process.env.PG_DATABASE || process.env.RDS_DB_NAME || 'postgres',
  username: process.env.PG_USER || process.env.RDS_USERNAME || 'postgres',
  password: process.env.PG_PASSWORD || process.env.RDS_PASSWORD || 'postgres'
};
