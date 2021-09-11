import { NextFunction, Request, Response, Router } from 'express';

import GoogleController from '../controllers/GoogleController';
import authMiddleware from '../middleware/authMiddleware';

export default function init(
  router: Router,
  googleController: GoogleController
) {
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
