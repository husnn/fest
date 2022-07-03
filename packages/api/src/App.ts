import {
  CommunityRepository,
  InviteRepository,
  NotificationRepository,
  OAuthRepository,
  PostRepository,
  TokenListingRepository,
  TokenOfferRepository,
  TokenOwnershipRepository,
  TokenRepository,
  TokenTradeRepository,
  UserRepository,
  WaitlistRepository,
  WalletRepository
} from '@fest/postgres';
import { CreateCommunity, NotificationService } from '@fest/core';
import { discordConfig, googleConfig, youTubeConfig } from './config';
import express, { Application, Router } from 'express';

import { AppConfig } from './types/AppConfig';
import AuthController from './controllers/AuthController';
import CommunityController from './controllers/CommunityController';
import ConfigController from './controllers/ConfigController';
import DiscordController from './controllers/DiscordController';
import { DiscordService } from '@fest/discord';
import { EthereumService } from '@fest/ethereum';
import FeedController from './controllers/FeedController';
import GoogleController from './controllers/GoogleController';
import GoogleService from './services/GoogleService';
import IPFSService from './services/IPFSService';
import InternalController from './controllers/InternalController';
import MailService from './services/MailService';
import MarketController from './controllers/MarketController';
import MediaStore from './services/MediaStore';
import PostController from './controllers/PostController';
import SearchController from './controllers/SearchController';
import TokenController from './controllers/TokenController';
import UserController from './controllers/UserController';
import WaitlistController from './controllers/WaitlistController';
import YouTubeController from './controllers/YouTubeController';
import YouTubeService from './services/YouTubeService';
import authMiddleware from './middleware/authMiddleware';
import contextMiddleware from './middleware/context';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import errorHandler from './middleware/errorHandler';
import { getRateLimiter } from './middleware/rateLimiting';
import initRoutes from './routes';
import { logger } from '@fest/logger';

class App {
  app: Application;
  config: AppConfig;

  constructor(config: AppConfig) {
    this.config = config;

    const app: Application = express();

    app.set('trust proxy', true);

    app.use(
      cors({
        origin: config.clientUrl,
        credentials: true,
        maxAge: 86400
      })
    );

    app.use(cookieParser());

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    app.disable('x-powered-by');

    app.get('/health', (req, res) => {
      res.status(200).send('Ok');
    });

    const userRepository = new UserRepository();
    const waitlistRepository = new WaitlistRepository();
    const inviteRepository = new InviteRepository();
    const oAuthRepository = new OAuthRepository();
    const walletRepository = new WalletRepository();
    const tokenRepository = new TokenRepository();
    const tokenOwnershipRepository = new TokenOwnershipRepository();
    const tokenListingRepository = new TokenListingRepository();
    const tokenTradeRepository = new TokenTradeRepository();
    const tokenOfferRepository = new TokenOfferRepository();
    const communityRepository = new CommunityRepository();
    const postRepository = new PostRepository();
    const notificationRepository = new NotificationRepository();

    const ethereumService: EthereumService = EthereumService.instance;
    const mailService = new MailService();

    const ipfsService = new IPFSService(
      process.env.PINATA_API_KEY,
      process.env.PINATA_API_SECRET
    );

    const authController = new AuthController(
      userRepository,
      walletRepository,
      waitlistRepository,
      inviteRepository,
      ethereumService,
      mailService
    );

    const waitlistController = new WaitlistController(waitlistRepository);

    const userController = new UserController(
      userRepository,
      walletRepository,
      tokenRepository,
      tokenOwnershipRepository,
      inviteRepository,
      communityRepository
    );

    const googleService = new GoogleService(googleConfig);

    const googleController = new GoogleController(
      oAuthRepository,
      googleService
    );

    const youTubeService = new YouTubeService(youTubeConfig);

    const youTubeController = new YouTubeController(
      oAuthRepository,
      googleService,
      youTubeService
    );

    const mediaStore = new MediaStore();

    const createCommunityUseCase = new CreateCommunity(
      tokenRepository,
      communityRepository
    );

    const tokenController = new TokenController(
      tokenRepository,
      mediaStore,
      ipfsService,
      userRepository,
      walletRepository,
      ethereumService,
      tokenOwnershipRepository,
      oAuthRepository,
      googleService,
      youTubeService,
      communityRepository,
      createCommunityUseCase
    );

    const marketController = new MarketController(
      tokenRepository,
      tokenOfferRepository,
      tokenListingRepository,
      tokenTradeRepository,
      walletRepository,
      ethereumService
    );

    const configController = new ConfigController(ethereumService);

    const internalController = new InternalController(
      configController,
      walletRepository,
      ethereumService
    );

    const communityController = new CommunityController(
      tokenRepository,
      userRepository,
      communityRepository
    );

    const feedController = new FeedController(
      userRepository,
      communityRepository,
      postRepository
    );

    const postController = new PostController(
      userRepository,
      postRepository,
      mediaStore
    );

    const searchController = new SearchController(userRepository);

    const notificationService = new NotificationService(
      notificationRepository,
      userRepository
    );

    const discordService = new DiscordService(discordConfig);
    const discordController = new DiscordController(
      oAuthRepository,
      walletRepository,
      tokenOwnershipRepository,
      communityRepository,
      discordService
    );

    app.use(authMiddleware);
    app.use(contextMiddleware);

    const router = Router();

    initRoutes(
      router,
      configController,
      waitlistController,
      authController,
      communityController,
      userController,
      googleController,
      youTubeController,
      tokenController,
      marketController,
      internalController,
      feedController,
      postController,
      searchController,
      notificationService,
      discordController
    );

    app.use(getRateLimiter());

    app.use('/v1', router);

    app.use(errorHandler);

    this.app = app;
  }

  getInstance = (): Application => this.app;

  onError(err: string) {
    logger.error(`Could not start app. ${err}`);
  }

  start() {
    const { protocol, host, port } = this.config;

    this.app
      .listen(port, host, () => {
        logger.info(`App running at ${protocol}://${host}:${port}`);
      })
      .on('error', this.onError);
  }
}

export default App;
