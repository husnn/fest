import { Router } from 'express';

import initAuthRoutes from './auth.routes';
import initGoogleRoutes from './google.routes';
import initTokenRoutes from './token.routes';
import initUserRoutes from './user.routes';
import initYouTubeRoutes from './youtube.routes';

export default function initRoutes (router: Router) {
  router.use('/auth', initAuthRoutes(router));
  router.use('/users', initUserRoutes(router));
  router.use('/google', initGoogleRoutes(router));
  router.use('/youtube', initYouTubeRoutes(router));
  router.use('/tokens', initTokenRoutes(router));
}
