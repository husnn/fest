import { TokenTradeRepository } from '@fest/core';
import { TokenTradeDTO } from '@fest/shared';
import UseCase from '../../base/UseCase';
import Result from '../../Result';

type GetTokenTradesInput = {
  user: string;
  count: number;
  page: number;
};

type GetTokenTradesOutput = {
  trades: TokenTradeDTO[];
  total: number;
};

export class GetTokenTrades extends UseCase<
  GetTokenTradesInput,
  GetTokenTradesOutput
> {
  private tradeRepository: TokenTradeRepository;

  constructor(tradeRepository: TokenTradeRepository) {
    super();

    this.tradeRepository = tradeRepository;
  }

  async exec(data: GetTokenTradesInput): Promise<Result<GetTokenTradesOutput>> {
    const result = await this.tradeRepository.findByBuyerOrSeller(
      data.user,
      {
        join: [
          { property: 'token_trade.tokenListing', alias: 'tokenListing' },
          { property: 'tokenListing.token', alias: 'token' }
        ]
      },
      data.count,
      data.page
    );

    return Result.ok({
      trades: result.trades.map((item) => {
        const trade = new TokenTradeDTO(item);
        trade.isSeller = trade.sellerId === data.user;
        return trade;
      }),
      total: result.total
    });
  }
}
