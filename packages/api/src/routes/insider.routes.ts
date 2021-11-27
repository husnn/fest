import authMiddleware from '../middleware/authMiddleware';
import InsiderController from '../controllers/InsiderController';
import { NextFunction, Request, Response, Router } from 'express';

export default function init(insiderController: InsiderController): Router {
  const router = Router();

  router.post(
    '/test-funds',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      insiderController.requestTestFunds(req, res, next)
  );

  return router;
}
