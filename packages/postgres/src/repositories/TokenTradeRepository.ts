import { TokenTrade, TokenTradeRepository as ITokenTradeRepository } from '@fanbase/core';

import TokenTradeSchema from '../schemas/TokenTradeSchema';
import { Repository } from './Repository';

export class TokenTradeRepository
  extends Repository<TokenTrade>
  implements ITokenTradeRepository
{
  constructor() {
    super(TokenTradeSchema);
  }

  async findByBuyer(
    buyer: string,
    count = 5,
    page = 1
  ): Promise<{ orders: TokenTrade[]; total: number }> {
    const [orders, total] = await this.db
      .createQueryBuilder('token_order')
      .where('token_order.buyerId = :buyer', { buyer })
      .skip((page - 1) * count)
      .take(count)
      .getManyAndCount();

    return { orders, total };
  }
}
