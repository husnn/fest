import { Router } from 'express';

import AuthController from '../controllers/AuthController';
import ConfigController from '../controllers/ConfigController';
import GoogleController from '../controllers/GoogleController';
import InsiderController from '../controllers/InsiderController';
import MarketController from '../controllers/MarketController';
import TokenController from '../controllers/TokenController';
import UserController from '../controllers/UserController';
import YouTubeController from '../controllers/YouTubeController';
import initAuthRoutes from './auth.routes';
import initGoogleRoutes from './google.routes';
import initMarketRoutes from './market.routes';
import initTokenRoutes from './token.routes';
import initUserRoutes from './user.routes';
import initYouTubeRoutes from './youtube.routes';
import initInsiderRoutes from './insider.routes';
import { isProduction } from '../config';

export default function initRoutes(
  router: Router,
  configController: ConfigController,
  authController: AuthController,
  userController: UserController,
  googleController: GoogleController,
  youTubeController: YouTubeController,
  tokenController: TokenController,
  marketController: MarketController,
  insiderController: InsiderController
) {
  router.get('/init', (req, res) => configController.init(req, res));

  if (!isProduction)
    router.use('/insider', initInsiderRoutes(router, insiderController));

  router.use('/auth', initAuthRoutes(router, authController));
  router.use('/users', initUserRoutes(router, userController));
  router.use('/google', initGoogleRoutes(router, googleController));
  router.use('/youtube', initYouTubeRoutes(router, youTubeController));
  router.use('/market', initMarketRoutes(router, marketController));
  router.use('/tokens', initTokenRoutes(router, tokenController));
}
