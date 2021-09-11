import { NextFunction, Request, Response, Router } from 'express';

import { GetTokenImageUploadUrlResponse } from '@fanbase/shared';

import TokenController from '../controllers/TokenController';
import { HttpError, HttpResponse } from '../http';
import authMiddleware from '../middleware/authMiddleware';
import pagination from '../middleware/pagination';
import TokenMediaStore from '../services/TokenMediaStore';

export default function init(
  router: Router,
  tokenController: TokenController
): Router {
  const mediaStore = new TokenMediaStore();

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
