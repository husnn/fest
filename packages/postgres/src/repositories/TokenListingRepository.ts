import { TokenListing, TokenListingRepository as ITokenListingRepository } from '@fanbase/core';
import { Protocol } from '@fanbase/shared';

import TokenListingSchema from '../schemas/TokenListingSchema';
import Repository from './Repository';

export class TokenListingRepository
  extends Repository<TokenListing>
  implements ITokenListingRepository
{
  constructor() {
    super(TokenListingSchema);
  }

  async findByChainData(
    protocol: Protocol,
    data: { contract: string; id: string }
  ): Promise<TokenListing> {
    const token = await this.db
      .createQueryBuilder('trade')
      .where('trade.protocol = :protocol', { protocol })
      .andWhere('trade.chain @> :data', { data })
      .getOne();

    return token;
  }
}

export default TokenListingRepository;
