import { NextFunction, Request, Response } from 'express';

import {
    BuyTokenListing, CancelTokenListing, GetListingsForToken, GetTokenMarketSummary, TokenRepository
} from '@fanbase/core';
import { EthereumService } from '@fanbase/ethereum';
import {
    TokenListingRepository, TokenOfferRepository, TokenTradeRepository, WalletRepository
} from '@fanbase/postgres';
import {
    CancelTokenListingResponse, GetListingsForTokenResponse, GetTokenMarketSummaryResponse
} from '@fanbase/shared';

import { HttpError, HttpResponse, ValidationError } from '../http';

export class MarketController {
  private getTokenMarketSummaryUseCase: GetTokenMarketSummary;
  private getListingsForTokenUseCase: GetListingsForToken;
  private buyTokenListingUseCase: BuyTokenListing;
  private cancelTokenListingUseCase: CancelTokenListing;

  constructor(
    tokenRepository: TokenRepository,
    tokenOfferRepository: TokenOfferRepository,
    tokenListingRepository: TokenListingRepository,
    tokenTradeRepository: TokenTradeRepository,
    walletRepository: WalletRepository,
    ethereumService: EthereumService
  ) {
    this.getTokenMarketSummaryUseCase = new GetTokenMarketSummary(
      tokenOfferRepository,
      tokenListingRepository,
      tokenTradeRepository
    );
    this.getListingsForTokenUseCase = new GetListingsForToken(
      tokenListingRepository
    );
    this.buyTokenListingUseCase = new BuyTokenListing(
      tokenListingRepository,
      walletRepository,
      ethereumService
    );
    this.cancelTokenListingUseCase = new CancelTokenListing(
      tokenListingRepository,
      walletRepository,
      ethereumService
    );
  }

  async cancelTokenListing(req: Request, res: Response, next: NextFunction) {
    try {
      const { listingId } = req.params;

      if (!listingId) throw new ValidationError();

      const result = await this.cancelTokenListingUseCase.exec({
        user: req.user,
        listing: listingId
      });

      if (!result.success) throw new HttpError();

      return new HttpResponse<CancelTokenListingResponse>(res, {
        txHash: result.data.txHash
      });
    } catch (err) {
      next(err);
    }
  }

  async buyTokenListing(req: Request, res: Response, next: NextFunction) {
    try {
      const { listingId } = req.params;
      const { quantity } = req.body;

      if (!listingId) throw new ValidationError();

      const result = await this.buyTokenListingUseCase.exec({
        buyer: req.user,
        listing: listingId,
        quantity
      });

      if (!result.success) throw new HttpError();

      return new HttpResponse<CancelTokenListingResponse>(res, {
        txHash: result.data.txHash
      });
    } catch (err) {
      next(err);
    }
  }

  async getListingsForToken(req: Request, res: Response, next: NextFunction) {
    const count = req.pagination.count;
    const page = req.pagination.page;

    try {
      const { tokenId } = req.params;
      const result = await this.getListingsForTokenUseCase.exec({
        token: tokenId,
        count,
        page
      });

      if (!result.success)
        throw new HttpError('Could not get listings for token.');

      return new HttpResponse<GetListingsForTokenResponse>(
        res,
        {
          body: result.data.listings
        },
        {
          count,
          page,
          total: result.data.total
        }
      );
    } catch (err) {
      next(err);
    }
  }

  async getTokenMarketSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.getTokenMarketSummaryUseCase.exec({
        user: req.user
      });

      if (!result.success) throw new HttpError('Could not get market summary.');

      return new HttpResponse<GetTokenMarketSummaryResponse>(res, result.data);
    } catch (err) {
      next(err);
    }
  }
}

export default MarketController;
