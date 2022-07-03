import { NextFunction, Request, Response, Router } from 'express';

import GoogleController from '../controllers/GoogleController';
import protectedRoute from '../middleware/protectedRoute';

export default function init(googleController: GoogleController) {
  const router = Router();

  router.post(
    '/unlink',
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      googleController.unlink(req, res, next)
  );

  router.get(
    '/linked',
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      googleController.checkLink(req, res, next)
  );

  router.get(
    '/link',
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      googleController.getAuthLink(req, res, next)
  );

  router.get('/callback', (req: Request, res: Response, next: NextFunction) =>
    googleController.link(req, res, next)
  );

  router.post(
    '/link',
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      googleController.link(req, res, next)
  );

  return router;
}
