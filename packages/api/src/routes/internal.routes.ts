import { NextFunction, Request, Response, Router } from 'express';

import InternalController from '../controllers/InternalController';
import { getRateLimiter } from '../middleware/rateLimiting';
import protectedRoute from '../middleware/protectedRoute';

export default function init(internalController: InternalController): Router {
  const router = Router();

  router.post(
    '/test-funds',
    getRateLimiter('requestTestFunds', { max: 5, windowInMins: 60 }),
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      internalController.requestTestFunds(req, res, next)
  );

  return router;
}
