import { NextFunction, Request, Response, Router } from 'express';

import TokenController from '../controllers/TokenController';
import { getRateLimiter } from '../middleware/rateLimiting';
import pagination from '../middleware/pagination';
import protectedRoute from '../middleware/protectedRoute';

export default function init(tokenController: TokenController): Router {
  const router = Router();

  router.get(
    '/image-upload-url',
    getRateLimiter('tokenMediaUpload', { max: 5, windowInMins: 10 }),
    (req: Request, res: Response, next: NextFunction) => {
      tokenController.getSignedTokenMediaUploadUrl(req, res, next);
    }
  );

  router.put(
    '/',
    getRateLimiter('createToken', { max: 5, windowInMins: 10 }),
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      tokenController.createToken(req, res, next)
  );

  router.get('/:id', (req: Request, res: Response, next: NextFunction) =>
    tokenController.getToken(req, res, next)
  );

  router.post(
    '/:id/list-for-sale',
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      tokenController.listForSale(req, res, next)
  );

  router.post(
    '/:id/approve-sale',
    protectedRoute,
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
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      tokenController.approveMint(req, res, next)
  );

  router.post(
    '/:id/mint',
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) => {
      tokenController.mint(req, res, next);
    }
  );

  return router;
}
