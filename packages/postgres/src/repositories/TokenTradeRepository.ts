import { TokenTrade, TokenTradeRepository as ITokenTradeRepository } from '@fanbase/core';
import { Protocol } from '@fanbase/shared';

import TokenTradeSchema from '../schemas/TokenTradeSchema';
import Repository from './Repository';

export class TokenTradeRepository
  extends Repository<TokenTrade>
  implements ITokenTradeRepository
{
  constructor() {
    super(TokenTradeSchema);
  }

  async findByChainData(
    protocol: Protocol,
    data: { contract: string; id: string }
  ): Promise<TokenTrade> {
    const token = await this.db
      .createQueryBuilder('trade')
      .where('trade.protocol = :protocol', { protocol })
      .andWhere('trade.chain @> :data', { data })
      .getOne();

    return token;
  }
}

export default TokenTradeRepository;
