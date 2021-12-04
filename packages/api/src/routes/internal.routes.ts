import { NextFunction, Request, Response, Router } from 'express';

import InternalController from '../controllers/InternalController';
import authMiddleware from '../middleware/authMiddleware';

export default function init(internalController: InternalController): Router {
  const router = Router();

  router.post(
    '/test-funds',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      internalController.requestTestFunds(req, res, next)
  );

  return router;
}
