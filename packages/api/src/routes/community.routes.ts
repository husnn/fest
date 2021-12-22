import { NextFunction, Request, Response, Router } from 'express';

import CommunityController from '../controllers/CommunityController';
import authMiddleware from '../middleware/authMiddleware';

export default function init(communityController: CommunityController) {
  const router = Router();

  router.post(
    '/',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      communityController.create(req, res, next)
  );

  router.get(
    '/:id',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      communityController.get(req, res, next)
  );

  router.get(
    '/:id/token',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      communityController.getToken(req, res, next)
  );

  return router;
}
