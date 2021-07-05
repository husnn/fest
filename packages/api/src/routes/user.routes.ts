import { NextFunction, Request, Response, Router } from 'express';

import {
    TokenOwnershipRepository, TokenRepository, UserRepository, WalletRepository
} from '@fanbase/postgres';

import UserController from '../controllers/UserController';
import authMiddleware from '../middleware/authMiddleware';
import pagination from '../middleware/pagination';

export default function init(router: Router) {
  const userRepository = new UserRepository();
  const walletRepository = new WalletRepository();
  const tokenRepository = new TokenRepository();
  const tokenOwnershipRepository = new TokenOwnershipRepository();

  const userController = new UserController(
    userRepository,
    walletRepository,
    tokenRepository,
    tokenOwnershipRepository
  );

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
