import { NotificationService } from '@fest/core';
import { Router } from 'express';
import { isProduction } from '../config';
import AuthController from '../controllers/AuthController';
import CommunityController from '../controllers/CommunityController';
import ConfigController from '../controllers/ConfigController';
import FeedController from '../controllers/FeedController';
import GoogleController from '../controllers/GoogleController';
import InternalController from '../controllers/InternalController';
import MarketController from '../controllers/MarketController';
import PostController from '../controllers/PostController';
import SearchController from '../controllers/SearchController';
import TokenController from '../controllers/TokenController';
import UserController from '../controllers/UserController';
import WaitlistController from '../controllers/WaitlistController';
import YouTubeController from '../controllers/YouTubeController';
import pagination from '../middleware/pagination';
import initAuthRoutes from './auth.routes';
import initCommunityRoutes from './community.routes';
import initFeedRoutes from './feed.routes';
import initGoogleRoutes from './google.routes';
import initInternalRoutes from './internal.routes';
import initMarketRoutes from './market.routes';
import initNotificationRoutes from './notification.routes';
import initPostRoutes from './post.routes';
import initTokenRoutes from './token.routes';
import initUserRoutes from './user.routes';
import initYouTubeRoutes from './youtube.routes';

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
  internalController: InternalController,
  feedController: FeedController,
  postController: PostController,
  searchController: SearchController,
  notificationService: NotificationService
) {
  if (!isProduction) {
    router.use('/internal', initInternalRoutes(internalController));
  }

  router.get('/init', (req, res) => configController.init(req, res));

  router.post('/waitlist', (req, res, next) =>
    waitlistController.joinWaitlist(req, res, next)
  );

  router.use('/auth', initAuthRoutes(authController));
  router.use('/users', initUserRoutes(userController));
  router.use('/notifications', initNotificationRoutes(notificationService));
  router.use('/google', initGoogleRoutes(googleController));
  router.use('/youtube', initYouTubeRoutes(youTubeController));
  router.use('/market', initMarketRoutes(marketController));
  router.use('/tokens', initTokenRoutes(tokenController));
  router.use('/communities', initCommunityRoutes(communityController));
  router.use('/feed', initFeedRoutes(feedController));
  router.use('/posts', initPostRoutes(postController));

  router.use('/search', pagination, (req, res, next) =>
    searchController.search(req, res, next)
  );
}
