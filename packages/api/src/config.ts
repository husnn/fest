import { PostgresConfig } from '@fanbase/postgres';

import { GoogleConfig } from './services/GoogleService';
import { YouTubeConfig } from './services/YouTubeService';
import { AppConfig } from './types/AppConfig';

const appConfig: AppConfig = {
  isProduction: process.env.NODE_ENV === 'production',
  protocol: 'http',
  host: process.env.HOST || '0.0.0.0',
  port: parseInt(process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET,
  apiVersion: 'v1',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000'
};

const getApiUrl = () =>
  process.env.API_URL ||
  `${appConfig.protocol}://${appConfig.host}${
    !appConfig.isProduction ? ':' + appConfig.port : null
  }/${appConfig.apiVersion}`;

const ethConfig = {
  provider: process.env.ETH_PROVIDER || 'http://localhost:8545'
};

const postgresConfig: PostgresConfig = {
  uri: process.env.DATABASE_URL,
  host: process.env.PG_HOST || '127.0.0.1',
  port: parseInt(process.env.PG_PORT) || 5432,
  database: process.env.PG_DATABASE || 'postgres',
  username: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres'
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
  ethConfig,
  googleConfig,
  youTubeConfig
};
