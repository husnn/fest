import { NextFunction, Request, Response, Router } from 'express';

import UserController from '../controllers/UserController';
import authMiddleware from '../middleware/authMiddleware';
import pagination from '../middleware/pagination';

export default function init(userController: UserController) {
  const router = Router();

  router.post(
    '/me',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      userController.editUser(req, res, next)
  );

  router.post(
    '/enable-creator',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      userController.enableCreatorMode(req, res, next)
  );

  router.get(
    '/referral',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      userController.getReferralSummary(req, res, next);
    }
  );

  router.get('/users/:id?', (req: Request, res: Response, next: NextFunction) =>
    userController.get(req, res, next)
  );

  router.get(
    '/:id/tokens-created',
    pagination,
    (req: Request, res: Response, next: NextFunction) =>
      userController.getTokensCreated(req, res, next)
  );

  router.get(
    '/:id/tokens-owned',
    pagination,
    (req: Request, res: Response, next: NextFunction) =>
      userController.getTokensOwned(req, res, next)
  );

  return router;
}
