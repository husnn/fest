import { NextFunction, Request, Response } from 'express';

import {
  BuyTokenListing,
  CancelTokenListing,
  EthereumService,
  GetListingsForToken,
  GetTokenMarketSummary,
  GetTokenTrades,
  TokenRepository,
  WithdrawMarketEarnings
} from '@fanbase/core';
import {
  TokenListingRepository,
  TokenOfferRepository,
  TokenTradeRepository,
  WalletRepository
} from '@fanbase/postgres';
import {
  CancelTokenListingResponse,
  Currency,
  GetListingsForTokenResponse,
  GetTokenMarketSummaryResponse,
  GetTokenTradesForUserResponse,
  WithdrawMarketEarningsResponse
} from '@fanbase/shared';

import { HttpError, HttpResponse, ValidationError } from '../http';

export class MarketController {
  private getTokenMarketSummaryUseCase: GetTokenMarketSummary;
  private getListingsForTokenUseCase: GetListingsForToken;
  private buyTokenListingUseCase: BuyTokenListing;
  private cancelTokenListingUseCase: CancelTokenListing;
  private getTokenTradesUseCase: GetTokenTrades;
  private withdrawEarningsUseCase: WithdrawMarketEarnings;

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
    this.getTokenTradesUseCase = new GetTokenTrades(tokenTradeRepository);
    this.withdrawEarningsUseCase = new WithdrawMarketEarnings(
      walletRepository,
      ethereumService
    );
  }

  async withdrawEarnings(req: Request, res: Response, next: NextFunction) {
    try {
      const { protocol, currency, amount } = req.body;

      if (!protocol || !currency || !amount) throw new ValidationError();

      const result = await this.withdrawEarningsUseCase.exec({
        user: req.user,
        protocol,
        currency,
        amount
      });

      if (!result.success)
        throw new HttpError('Could not withdraw market earnings.');

      return new HttpResponse<WithdrawMarketEarningsResponse>(res, {
        txHash: result.data.txHash
      });
    } catch (err) {
      next(err);
    }
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

  async getTokenTradesForUser(req: Request, res: Response, next: NextFunction) {
    const count = req.pagination.count;
    const page = req.pagination.page;

    try {
      const result = await this.getTokenTradesUseCase.exec({
        user: req.user,
        count,
        page
      });
      if (!result.success)
        throw new HttpError('Could not get trades for user.');

      return new HttpResponse<GetTokenTradesForUserResponse>(
        res,
        { body: result.data.trades },
        { count, page, total: result.data.total }
      );
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
