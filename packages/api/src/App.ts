import {
  CommunityRepository,
  InviteRepository,
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
import {
  CreateCommunity,
  EthereumService as IEthereumService
} from '@fest/core';
import express, { Application, Router } from 'express';
import { googleConfig, youTubeConfig } from './config';

import { AppConfig } from './types/AppConfig';
import AuthController from './controllers/AuthController';
import CommunityController from './controllers/CommunityController';
import ConfigController from './controllers/ConfigController';
import { EthereumService } from '@fest/ethereum';
import FeedController from './controllers/FeedController';
import GoogleController from './controllers/GoogleController';
import GoogleService from './services/GoogleService';
import IPFSService from './services/IPFSService';
import InternalController from './controllers/InternalController';
import MailService from './services/MailService';
import MarketController from './controllers/MarketController';
import PostController from './controllers/PostController';
import TokenController from './controllers/TokenController';
import TokenMediaStore from './services/TokenMediaStore';
import UserController from './controllers/UserController';
import WaitlistController from './controllers/WaitlistController';
import YouTubeController from './controllers/YouTubeController';
import YouTubeService from './services/YouTubeService';
import cors from 'cors';
import errorHandler from './middleware/errorHandler';
import initRoutes from './routes';

class App {
  app: Application;
  config: AppConfig;

  constructor(config: AppConfig) {
    this.config = config;

    const app: Application = express();

    app.use(cors());

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

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

    const ethereumService: IEthereumService = EthereumService.instance;
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

    const mediaStore = new TokenMediaStore();

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
      postController
    );

    app.use('/v1', router);

    app.use(errorHandler);

    this.app = app;
  }

  getInstance = (): Application => this.app;

  onError(err: string) {
    console.log(`Could not start app. ${err}`);
  }

  start() {
    const { protocol, host, port } = this.config;

    this.app
      .listen(port, host, () => {
        console.log(`App running at ${protocol}://${host}:${port}`);
      })
      .on('error', this.onError);
  }
}

export default App;
