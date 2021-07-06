import { NextFunction, Request, Response, Router } from 'express';

import { EthereumService } from '@fanbase/ethereum';
import {
    TokenOwnershipRepository, TokenRepository, UserRepository, WalletRepository
} from '@fanbase/postgres';

import TokenController from '../controllers/TokenController';
import authMiddleware from '../middleware/authMiddleware';
import pagination from '../middleware/pagination';
import { MetadataStore } from '../services/MetadataStore';
import TokenMediaStore from '../services/TokenMediaStore';

export default function init(router: Router): Router {
  const userRepository = new UserRepository();

  const tokenRepository = new TokenRepository();
  const metadataStore = new MetadataStore(
    process.env.PINATA_API_KEY,
    process.env.PINATA_API_SECRET
  );
  const mediaStore = new TokenMediaStore();

  const walletRepository = new WalletRepository();
  const tokenOwnershipRepository = new TokenOwnershipRepository();

  const ethereumService = EthereumService.instance;

  const tokenController = new TokenController(
    tokenRepository,
    metadataStore,
    userRepository,
    walletRepository,
    ethereumService,
    tokenOwnershipRepository
  );

  router.get('/image-upload-url', async (req: Request, res: Response) => {
    const url = await mediaStore.getImageUploadUrl(
      req.query.filename as string,
      req.query.type as string
    );

    res.send(url);
  });

  router.put(
    '/',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      tokenController.createToken(req, res, next)
  );

  router.get('/:id', (req: Request, res: Response, next: NextFunction) =>
    tokenController.getToken(req, res, next)
  );

  router.get(
    '/:id/ownerships',
    pagination,
    (req: Request, res: Response, next: NextFunction) =>
      tokenController.getOwnerships(req, res, next)
  );

  router.get(
    '/:id/ownerships/:ownershipId',
    (req: Request, res: Response, next: NextFunction) =>
      tokenController.getOwnership(req, res, next)
  );

  router.post(
    '/:id/approve-mint',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      tokenController.approveMint(req, res, next)
  );

  router.post(
    '/:id/mint',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      tokenController.mint(req, res, next);
    }
  );

  return router;
}
