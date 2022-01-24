import { TokenListingDTO, TokenOfferDTO, TokenTradeDTO } from '@fest/shared';

import UseCase from '../../base/UseCase';
import {
  TokenListingRepository,
  TokenOfferRepository,
  TokenTradeRepository
} from '../../repositories';
import { Result } from '../../Result';

interface GetTokenMarketSummaryInput {
  user: string;
}

interface GetTokenMarketSummaryOutput {
  offers: TokenOfferDTO[];
  listings: TokenListingDTO[];
  trades: TokenTradeDTO[];
}

export class GetTokenMarketSummary extends UseCase<
  GetTokenMarketSummaryInput,
  GetTokenMarketSummaryOutput
> {
  private offerRepository: TokenOfferRepository;
  private listingRepository: TokenListingRepository;
  private tradeRepository: TokenTradeRepository;

  constructor(
    tokenOfferRepository: TokenOfferRepository,
    listingRepository: TokenListingRepository,
    tradeRepository: TokenTradeRepository
  ) {
    super();

    this.offerRepository = tokenOfferRepository;
    this.listingRepository = listingRepository;
    this.tradeRepository = tradeRepository;
  }

  async exec(
    data: GetTokenMarketSummaryInput
  ): Promise<Result<GetTokenMarketSummaryOutput>> {
    const offers = (
      await this.offerRepository.findByReceiver(data.user)
    ).offers.map((offer) => new TokenOfferDTO(offer));

    const listings = (
      await this.listingRepository.findBySeller(data.user, { onlyActive: true })
    ).listings.map((listing) => new TokenListingDTO(listing));

    const trades = (
      await this.tradeRepository.findByBuyerOrSeller(data.user, {
        join: [
          { property: 'token_trade.tokenListing', alias: 'tokenListing' },
          { property: 'tokenListing.token', alias: 'token' }
        ]
      })
    ).trades.map((item) => {
      const trade = new TokenTradeDTO(item);
      trade.isSeller = trade.sellerId === data.user;
      return trade;
    });

    return Result.ok({ offers, listings, trades });
  }
}

export default GetTokenMarketSummary;
