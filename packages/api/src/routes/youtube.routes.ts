import { NextFunction, Request, Response, Router } from 'express';

import { OAuthRepository } from '@fanbase/postgres';

import { googleConfig, youTubeConfig } from '../config';
import YouTubeController from '../controllers/YouTubeController';
import authMiddleware from '../middleware/authMiddleware';
import GoogleService from '../services/GoogleService';
import YouTubeService from '../services/YouTubeService';

export default function init (router: Router) {
  const googleService = new GoogleService(googleConfig);
  const oAuthRepository = new OAuthRepository();
  const youTubeService = new YouTubeService(youTubeConfig);

  const youTubeController = new YouTubeController(
    oAuthRepository,
    googleService,
    youTubeService
  );

  router.get(
    '/uploads',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      youTubeController.getOwnUploads(req, res, next)
  );

  return router;
}
