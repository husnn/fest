import { TokenOrder, TokenOrderRepository as ITokenOrderRepository } from '@fanbase/core';

import TokenOrderSchema from '../schemas/TokenOrderSchema';
import { Repository } from './Repository';

export class TokenOrderRepository
  extends Repository<TokenOrder>
  implements ITokenOrderRepository
{
  constructor() {
    super(TokenOrderSchema);
  }
}
