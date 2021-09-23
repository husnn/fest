import {
  TokenTrade,
  TokenTradeRepository as ITokenTradeRepository
} from '@fanbase/core';

import TokenTradeSchema from '../schemas/TokenTradeSchema';
import { Repository } from './Repository';

export class TokenTradeRepository
  extends Repository<TokenTrade>
  implements ITokenTradeRepository
{
  constructor() {
    super(TokenTradeSchema);
  }

  async findByBuyerOrSeller(
    user: string,
    options?: { join?: Array<{ property: string; alias: string }> },
    count = 5,
    page = 1
  ): Promise<{ trades: TokenTrade[]; total: number }> {
    const query = this.db
      .createQueryBuilder('token_trade')
      .where('token_trade.buyerId = :user', { user })
      .orWhere('token_trade.sellerId = :user', { user })
      .skip((page - 1) * count)
      .take(count);

    if (options?.join) {
      options.join.forEach((join) => {
        query.leftJoinAndSelect(join.property, join.alias);
      });
    }

    const [trades, total] = await query.getManyAndCount();

    return { trades, total };
  }

  async findByBuyer(
    buyer: string,
    options?: { join?: Array<keyof TokenTrade> },
    count = 5,
    page = 1
  ): Promise<{ trades: TokenTrade[]; total: number }> {
    const query = this.db
      .createQueryBuilder('token_trade')
      .where('token_trade.buyerId = :buyer', { buyer })
      .skip((page - 1) * count)
      .take(count);

    if (options?.join) {
      options.join.forEach((property) => {
        query.leftJoinAndSelect(`token_trade.${property}`, property);
      });
    }

    const [trades, total] = await query.getManyAndCount();

    return { trades, total };
  }
}
