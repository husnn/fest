import { TokenOffer, TokenOfferRepository as ITokenOfferRepository } from '@fanbase/core';

import TokenOfferSchema from '../schemas/TokenOfferSchema';
import { Repository } from './Repository';

export class TokenOfferRepository
  extends Repository<TokenOffer>
  implements ITokenOfferRepository
{
  constructor() {
    super(TokenOfferSchema);
  }
}
