import cors from 'cors';
import express, { Application, Router } from 'express';

import { EthereumService } from '@fanbase/ethereum';
import {
    OAuthRepository, TokenListingRepository, TokenOfferRepository, TokenOwnershipRepository,
    TokenRepository, TokenTradeRepository, UserRepository, WalletRepository
} from '@fanbase/postgres';

import { googleConfig, youTubeConfig } from './config';
import AuthController from './controllers/AuthController';
import ConfigController from './controllers/ConfigController';
import GoogleController from './controllers/GoogleController';
import MarketController from './controllers/MarketController';
import TokenController from './controllers/TokenController';
import UserController from './controllers/UserController';
import YouTubeController from './controllers/YouTubeController';
import errorHandler from './middleware/errorHandler';
import initRoutes from './routes';
import GoogleService from './services/GoogleService';
import MailService from './services/MailService';
import MetadataStore from './services/MetadataStore';
import TokenMediaStore from './services/TokenMediaStore';
import YouTubeService from './services/YouTubeService';
import { AppConfig } from './types/AppConfig';

class App {
  app: Application;
  config: AppConfig;

  constructor(config: AppConfig) {
    this.config = config;

    const app: Application = express();

    app.use(cors());

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    const userRepository = new UserRepository();
    const oAuthRepository = new OAuthRepository();
    const walletRepository = new WalletRepository();
    const tokenRepository = new TokenRepository();
    const tokenOwnershipRepository = new TokenOwnershipRepository();
    const tokenListingRepository = new TokenListingRepository();
    const tokenTradeRepository = new TokenTradeRepository();
    const tokenOfferRepository = new TokenOfferRepository();

    const ethereumService = EthereumService.instance;
    const mailService = new MailService();

    const metadataStore = new MetadataStore(
      process.env.PINATA_API_KEY,
      process.env.PINATA_API_SECRET
    );

    const authController = new AuthController(
      userRepository,
      walletRepository,
      ethereumService,
      mailService
    );

    const userController = new UserController(
      userRepository,
      walletRepository,
      tokenRepository,
      tokenOwnershipRepository
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

    const tokenController = new TokenController(
      tokenRepository,
      mediaStore,
      metadataStore,
      userRepository,
      walletRepository,
      ethereumService,
      tokenOwnershipRepository,
      oAuthRepository,
      googleService,
      youTubeService
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

    const router = Router();

    initRoutes(
      router,
      configController,
      authController,
      userController,
      googleController,
      youTubeController,
      tokenController,
      marketController
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
