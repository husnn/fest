import { NextFunction, Request, Response, Router } from 'express';

import { EthereumService } from '@fanbase/ethereum';
import {
    OAuthRepository, TokenOwnershipRepository, TokenRepository, UserRepository, WalletRepository
} from '@fanbase/postgres';
import { GetTokenImageUploadUrlResponse } from '@fanbase/shared';

import { googleConfig, youTubeConfig } from '../config';
import TokenController from '../controllers/TokenController';
import { HttpError, HttpResponse } from '../http';
import authMiddleware from '../middleware/authMiddleware';
import pagination from '../middleware/pagination';
import GoogleService from '../services/GoogleService';
import { MetadataStore } from '../services/MetadataStore';
import TokenMediaStore from '../services/TokenMediaStore';
import YouTubeService from '../services/YouTubeService';

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

  const oAuthRepository = new OAuthRepository();

  const googleService = new GoogleService(googleConfig);
  const youTubeService = new YouTubeService(youTubeConfig);

  const ethereumService = EthereumService.instance;

  const tokenController = new TokenController(
    tokenRepository,
    metadataStore,
    userRepository,
    walletRepository,
    ethereumService,
    tokenOwnershipRepository,
    oAuthRepository,
    googleService,
    youTubeService
  );

  router.get(
    '/image-upload-url',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await mediaStore.getImageUploadUrl(
          req.query.filename as string,
          req.query.filetype as string
        );

        if (!result.success)
          throw new HttpError('Could not create upload URL.');

        const { signedUrl, url } = result.data;

        return new HttpResponse<GetTokenImageUploadUrlResponse>(res, {
          signedUrl,
          url
        });
      } catch (err) {
        next(err);
      }
    }
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

  router.post(
    '/:id/list-for-sale',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      tokenController.listForSale(req, res, next)
  );

  router.post(
    '/:id/approve-sale',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      tokenController.approveSale(req, res, next)
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
