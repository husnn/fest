import { NextFunction, Request, Response, Router } from 'express';
import Web3 from 'web3';

import { EthereumService } from '@fanbase/ethereum';
import { TokenRepository, UserRepository, WalletRepository } from '@fanbase/postgres';

import { ethConfig } from '../config';
import UserController from '../controllers/UserController';
import authMiddleware from '../middleware/authMiddleware';
import MailService from '../services/MailService';

export default function init(router: Router) {
  const userRepository = new UserRepository();
  const walletRepository = new WalletRepository();
  const tokenRepository = new TokenRepository();

  const web3 = new Web3(ethConfig.provider);
  const ethereumService = new EthereumService(web3);

  const mailService = new MailService();

  const userController = new UserController(
    userRepository,
    walletRepository,
    tokenRepository,
    ethereumService,
    mailService
  );

  router.get('/', (req: Request, res: Response, next: NextFunction) =>
    userController.get(req, res, next)
  );

  router.post(
    '/me',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      userController.editUser(req, res, next)
  );

  router.get(
    '/:id/tokens-created',
    (req: Request, res: Response, next: NextFunction) =>
      userController.getTokensCreated(req, res, next)
  );

  return router;
}
