import { PostgresConfig } from '@fanbase/postgres';

import { GoogleConfig } from './services/GoogleService';
import { YouTubeConfig } from './services/YouTubeService';
import { AppConfig } from './types/AppConfig';

const appConfig: AppConfig = {
  isProduction: process.env.NODE_ENV === 'production',
  protocol: 'http',
  host: process.env.HOST || '0.0.0.0',
  port: parseInt(process.env.API_PORT || process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET,
  apiVersion: 'v1',
  clientUrl: process.env.CLIENT_URL || `http://localhost:3000`
};

const getApiUrl = () =>
  process.env.API_URL ||
  `http://localhost:${[appConfig.port]}/${appConfig.apiVersion}`;

const indexerConfig = {
  host: process.env.INDEXER_HOST || '0.0.0.0',
  port: parseInt(process.env.INDEXER_PORT) || 7070
};

const ethConfig = {
  provider: process.env.ETH_PROVIDER || 'http://localhost:8545'
};

const mailConfig = {
  from: {
    noreply: process.env.MAIL_FROM_NO_REPLY
  },
  sendgrid: {
    apiUrl: process.env.SENDGRID_API_KEY
  }
};

const postgresConfig: PostgresConfig = {
  uri: process.env.PG_URL || process.env.DATABASE_URL,
  host: process.env.PG_HOST || process.env.RDS_HOSTNAME || '127.0.0.1',
  port: parseInt(process.env.PG_PORT || process.env.RDS_PORT) || 5432,
  database: process.env.PG_DATABASE || process.env.RDS_DB_NAME || 'postgres',
  username: process.env.PG_USER || process.env.RDS_USERNAME || 'postgres',
  password: process.env.PG_PASSWORD || process.env.RDS_PASSWORD || 'postgres'
};

const googleConfig: GoogleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUrl:
    process.env.GOOGLE_REDIRECT_URL || `${getApiUrl()}/google/callback`
};

const youTubeConfig: YouTubeConfig = {
  apiKey: process.env.YOUTUBE_API_KEY
};

export {
  appConfig,
  getApiUrl,
  postgresConfig,
  indexerConfig,
  ethConfig,
  mailConfig,
  googleConfig,
  youTubeConfig
};
