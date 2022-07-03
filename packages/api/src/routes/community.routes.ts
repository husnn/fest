import { NextFunction, Request, Response, Router } from 'express';

import CommunityController from '../controllers/CommunityController';
import protectedRoute from '../middleware/protectedRoute';

export default function init(communityController: CommunityController) {
  const router = Router();

  router.post(
    '/',
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      communityController.create(req, res, next)
  );

  router.get(
    '/:id',
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      communityController.get(req, res, next)
  );

  return router;
}
