import { NextFunction, Request, Response, Router } from 'express';

import MarketController from '../controllers/MarketController';
import authMiddleware from '../middleware/authMiddleware';
import pagination from '../middleware/pagination';

export default function init(
  router: Router,
  marketController: MarketController
): Router {
  router.get(
    '/summary',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      marketController.getTokenMarketSummary(req, res, next)
  );

  router.post(
    '/listings/:listingId/cancel',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      marketController.cancelTokenListing(req, res, next)
  );

  router.post(
    '/listings/:listingId/buy',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      marketController.buyTokenListing(req, res, next)
  );

  router.get(
    '/tokens/:tokenId/listings',
    pagination,
    (req: Request, res: Response, next: NextFunction) =>
      marketController.getListingsForToken(req, res, next)
  );

  return router;
}