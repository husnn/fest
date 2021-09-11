import { TokenListingDTO, TokenOfferDTO, TokenTradeDTO } from '@fanbase/shared';

import UseCase from '../../base/UseCase';
import {
    TokenListingRepository, TokenOfferRepository, TokenTradeRepository
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
  private orderRepository: TokenTradeRepository;

  constructor(
    tokenOfferRepository: TokenOfferRepository,
    listingRepository: TokenListingRepository,
    orderRepository: TokenTradeRepository
  ) {
    super();

    this.offerRepository = tokenOfferRepository;
    this.listingRepository = listingRepository;
    this.orderRepository = orderRepository;
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
      await this.orderRepository.findByBuyer(data.user)
    ).orders.map((order) => new TokenTradeDTO(order));

    return Result.ok({ offers, listings, trades });
  }
}

export default GetTokenMarketSummary;
