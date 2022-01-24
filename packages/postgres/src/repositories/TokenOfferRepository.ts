import {
  TokenOffer,
  TokenOfferRepository as ITokenOfferRepository
} from '@fest/core';

import TokenOfferSchema from '../schemas/TokenOfferSchema';
import { Repository } from './Repository';

export class TokenOfferRepository
  extends Repository<TokenOffer>
  implements ITokenOfferRepository
{
  constructor() {
    super(TokenOfferSchema);
  }

  async findByReceiver(
    receiver: string,
    count = 5,
    page = 1
  ): Promise<{ offers: TokenOffer[]; total: number }> {
    const [offers, total] = await this.db
      .createQueryBuilder('token_offer')
      .where('token_offer.receiverId = :receiver', { receiver })
      .skip((page - 1) * count)
      .take(count)
      .getManyAndCount();

    return { offers, total };
  }
}
