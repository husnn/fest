import { NextFunction, Request, Response, Router } from 'express';

import FeedController from '../controllers/FeedController';
import protectedRoute from '../middleware/protectedRoute';

export default function init(feedController: FeedController): Router {
  const router = Router();

  router.post(
    '/',
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      feedController.getFeed(req, res, next)
  );

  return router;
}
