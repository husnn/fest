import { NextFunction, Request, Response, Router } from 'express';
import Web3 from 'web3';

import { EthereumService } from '@fanbase/ethereum';
import { TokenRepository, UserRepository, WalletRepository } from '@fanbase/postgres';

import { ethConfig } from '../config';
import AuthController from '../controllers/AuthController';
import MailService from '../services/MailService';

export default function init (router: Router) {
  const userRepository = new UserRepository();
  const walletRepository = new WalletRepository();
  const tokenRepository = new TokenRepository();

  const web3 = new Web3(ethConfig.provider);
  const ethereumService = new EthereumService(web3);

  const mailService = new MailService();

  const authController = new AuthController(
    userRepository,
    walletRepository,
    tokenRepository,
    ethereumService,
    mailService
  );

  router.post(
    '/identify/email',
    (req: Request, res: Response, next: NextFunction) =>
      authController.identifyWithEmail(req, res, next)
  );

  router.post(
    '/identify/wallet',
    (req: Request, res: Response, next: NextFunction) =>
      authController.identifyWithWallet(req, res, next)
  );

  router.post(
    '/login/email',
    (req: Request, res: Response, next: NextFunction) =>
      authController.loginWithEmail(req, res, next)
  );

  router.post(
    '/login/wallet',
    (req: Request, res: Response, next: NextFunction) =>
      authController.loginWithWallet(req, res, next)
  );

  return router;
}
