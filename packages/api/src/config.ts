import {
  DiscordConfig,
  defaultConfig as defaultDiscordConfig
} from '@fest/discord';

import { AppConfig } from './types/AppConfig';
import { GoogleConfig } from './services/GoogleService';
import { YouTubeConfig } from './services/YouTubeService';

export const isDev =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined;
export const isProduction = process.env.NODE_ENV === 'production';
export const isStaging = process.env.NODE_ENV === 'staging';

const appConfig: AppConfig = {
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

const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379'
};

const indexerConfig = {
  host: process.env.INDEXER_HOST || '0.0.0.0',
  port: parseInt(process.env.INDEXER_PORT) || 9000
};

const ethConfig = {
  provider: process.env.ETH_PROVIDER || 'http://0.0.0.0:8545'
};

const mailConfig = {
  from: {
    noreply: process.env.MAIL_FROM_NO_REPLY
  },
  sendgrid: {
    apiUrl: process.env.SENDGRID_API_KEY
  }
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

const discordConfig: DiscordConfig = {
  ...defaultDiscordConfig,
  redirectUrl: `${appConfig.clientUrl}/link/discord`
};

export const authCookieName = isStaging ? 'staging_auth' : 'auth';

export {
  appConfig,
  getApiUrl,
  redisConfig,
  indexerConfig,
  ethConfig,
  mailConfig,
  googleConfig,
  youTubeConfig,
  discordConfig
};
