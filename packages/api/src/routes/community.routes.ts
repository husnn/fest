import { NextFunction, Request, Response, Router } from 'express';

import CommunityController from '../controllers/CommunityController';
import authMiddleware from '../middleware/authMiddleware';

export default function init(
  router: Router,
  communityController: CommunityController
) {
  router.post(
    '/',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      communityController.create(req, res, next)
  );

  return router;
}
