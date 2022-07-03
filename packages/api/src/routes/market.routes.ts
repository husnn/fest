import { NextFunction, Request, Response, Router } from 'express';

import MarketController from '../controllers/MarketController';
import pagination from '../middleware/pagination';
import protectedRoute from '../middleware/protectedRoute';

export default function init(marketController: MarketController): Router {
  const router = Router();

  router.get(
    '/summary',
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      marketController.getTokenMarketSummary(req, res, next)
  );

  router.post(
    '/listings/:listingId/cancel',
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      marketController.cancelTokenListing(req, res, next)
  );

  router.post(
    '/listings/:listingId/buy',
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      marketController.buyTokenListing(req, res, next)
  );

  router.get(
    '/trades',
    pagination,
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      marketController.getTokenTradesForUser(req, res, next)
  );

  router.post(
    '/withdraw',
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      marketController.withdrawEarnings(req, res, next)
  );

  router.get(
    '/tokens/:tokenId/listings',
    pagination,
    (req: Request, res: Response, next: NextFunction) =>
      marketController.getListingsForToken(req, res, next)
  );

  return router;
}
