import { NextFunction, Request, Response, Router } from 'express';

import UserController from '../controllers/UserController';
import authMiddleware from '../middleware/authMiddleware';
import pagination from '../middleware/pagination';

export default function init(router: Router, userController: UserController) {
  router.post(
    '/me',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      userController.editUser(req, res, next)
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
