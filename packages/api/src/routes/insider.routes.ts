import { NextFunction, Request, Response, Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import InsiderController from '../controllers/InsiderController';

export default function init(
  router: Router,
  insiderController: InsiderController
): Router {
  router.post(
    '/test-funds',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      insiderController.requestTestFunds(req, res, next)
  );

  return router;
}
