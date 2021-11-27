import AuthController from '../controllers/AuthController';
import CommunityController from '../controllers/CommunityController';
import ConfigController from '../controllers/ConfigController';
import GoogleController from '../controllers/GoogleController';
import InsiderController from '../controllers/InsiderController';
import MarketController from '../controllers/MarketController';
import { Router } from 'express';
import TokenController from '../controllers/TokenController';
import UserController from '../controllers/UserController';
import WaitlistController from '../controllers/WaitlistController';
import YouTubeController from '../controllers/YouTubeController';
import initAuthRoutes from './auth.routes';
import initCommunityRoutes from './community.routes';
import initGoogleRoutes from './google.routes';
import initInsiderRoutes from './insider.routes';
import initMarketRoutes from './market.routes';
import initTokenRoutes from './token.routes';
import initUserRoutes from './user.routes';
import initYouTubeRoutes from './youtube.routes';
import { isProduction } from '../config';

export default function initRoutes(
  router: Router,
  configController: ConfigController,
  waitlistController: WaitlistController,
  authController: AuthController,
  communityController: CommunityController,
  userController: UserController,
  googleController: GoogleController,
  youTubeController: YouTubeController,
  tokenController: TokenController,
  marketController: MarketController,
  insiderController: InsiderController
) {
  if (!isProduction) {
    router.use('/insider', initInsiderRoutes(insiderController));
  }

  router.get('/init', (req, res) => configController.init(req, res));

  router.post('/waitlist', (req, res, next) =>
    waitlistController.joinWaitlist(req, res, next)
  );

  router.use('/auth', initAuthRoutes(authController));
  router.use('/users', initUserRoutes(userController));
  router.use('/google', initGoogleRoutes(googleController));
  router.use('/youtube', initYouTubeRoutes(youTubeController));
  router.use('/market', initMarketRoutes(marketController));
  router.use('/tokens', initTokenRoutes(tokenController));
  router.use('/communities', initCommunityRoutes(communityController));
}
