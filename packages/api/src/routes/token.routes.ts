import { NextFunction, Request, Response, Router } from 'express';
import Web3 from 'web3';

import { EthereumService } from '@fanbase/ethereum';
import { TokenRepository, UserRepository, WalletRepository } from '@fanbase/postgres';

import { ethConfig } from '../config';
import TokenController from '../controllers/TokenController';
import authMiddleware from '../middleware/authMiddleware';

export default function init(router: Router): Router {
  const userRepository = new UserRepository();
  const tokenRepository = new TokenRepository();
  const walletRepository = new WalletRepository();

  const web3 = new Web3(ethConfig.provider);

  const ethereumService = new EthereumService(web3);

  const tokenController = new TokenController(
    tokenRepository,
    userRepository,
    walletRepository,
    ethereumService
  );

  router.put(
    '/',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      tokenController.createToken(req, res, next)
  );

  router.get('/:id', (req: Request, res: Response, next: NextFunction) =>
    tokenController.getToken(req, res, next)
  );

  router.post('/approve-mint', authMiddleware, (req: Request, res: Response) =>
    tokenController.approveMint(req, res)
  );

  return router;
}
