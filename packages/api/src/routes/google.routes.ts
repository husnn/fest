import { NextFunction, Request, Response, Router } from 'express';

import { OAuthRepository } from '@fanbase/postgres';

import { googleConfig } from '../config';
import GoogleController from '../controllers/GoogleController';
import authMiddleware from '../middleware/authMiddleware';
import GoogleService from '../services/GoogleService';

export default function init(router: Router) {
  const googleService = new GoogleService(googleConfig);
  const oAuthRepository = new OAuthRepository();
  const googleController = new GoogleController(oAuthRepository, googleService);

  router.post(
    '/unlink',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      googleController.unlink(req, res, next)
  );

  router.get(
    '/linked',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      googleController.checkLink(req, res, next)
  );

  router.get(
    '/link',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      googleController.getAuthLink(req, res, next)
  );

  router.get('/callback', (req: Request, res: Response, next: NextFunction) =>
    googleController.link(req, res, next)
  );

  router.post(
    '/link',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      googleController.link(req, res, next)
  );

  return router;
}
