import { TokenRepository as ITokenRepository } from '@fanbase/core';
import { Token } from '@fanbase/shared';

import TokenSchema from '../schemas/TokenSchema';
import Repository from './Repository';

export class TokenRepository
  extends Repository<Token>
  implements ITokenRepository {
  constructor () {
    super(TokenSchema);
  }

  async findByCreator (user: string): Promise<Token[]> {
    return this.db.find({ creatorId: user });
  }
}

export default TokenRepository;
