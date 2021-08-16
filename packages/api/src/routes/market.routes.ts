import { NextFunction, Request, Response, Router } from 'express';

import { EthereumService } from '@fanbase/ethereum';
import {
    TokenListingRepository, TokenOfferRepository, TokenRepository, TokenTradeRepository,
    WalletRepository
} from '@fanbase/postgres';

import MarketController from '../controllers/MarketController';
import authMiddleware from '../middleware/authMiddleware';

export default function init(router: Router): Router {
  const tokenRepository = new TokenRepository();
  const tokenOfferRepository = new TokenOfferRepository();
  const tokenListingRepository = new TokenListingRepository();
  const tokenTradeRepository = new TokenTradeRepository();
  const walletRepository = new WalletRepository();

  const marketController = new MarketController(
    tokenRepository,
    tokenOfferRepository,
    tokenListingRepository,
    tokenTradeRepository,
    walletRepository,
    EthereumService.instance
  );

  router.get(
    '/summary',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      marketController.getTokenMarketSummary(req, res, next)
  );

  router.post(
    '/listings/:listingId/cancel',
    (req: Request, res: Response, next: NextFunction) =>
      marketController.cancelTokenListing(req, res, next)
  );

  router.get(
    '/tokens/:tokenId/listings',
    (req: Request, res: Response, next: NextFunction) =>
      marketController.getListingsForToken(req, res, next)
  );

  return router;
}
