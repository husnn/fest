import {
    TokenOwnership, TokenOwnershipRepository as ITokenOwnershipRepository
} from '@fanbase/core';

import TokenOwnershipSchema from '../schemas/TokenOwnershipSchema';
import Repository from './Repository';

class TokenOwnershipRepository
  extends Repository<TokenOwnership>
  implements ITokenOwnershipRepository
{
  constructor() {
    super(TokenOwnershipSchema);
  }

  async findByOwner(user: string): Promise<TokenOwnership[]> {
    return this.db.find({ ownerId: user });
  }

  async findByToken(token: string): Promise<TokenOwnership[]> {
    return this.db.find({ tokenId: token });
  }
}

export default TokenOwnershipRepository;
