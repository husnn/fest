import { NextFunction, Request, Response, Router } from 'express';

import FeedController from '../controllers/FeedController';
import authMiddleware from '../middleware/authMiddleware';

export default function init(feedController: FeedController): Router {
  const router = Router();

  router.post(
    '/',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      feedController.getFeed(req, res, next)
  );

  return router;
}
