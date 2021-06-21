import {
    TokenOwnership, TokenOwnershipRepository as ITokenOwnershipRepository
} from '@fanbase/core';

import TokenOwnershipSchema from '../schemas/TokenOwnershipSchema';
import Repository from './Repository';

export class TokenOwnershipRepository
  extends Repository<TokenOwnership>
  implements ITokenOwnershipRepository
{
  constructor() {
    super(TokenOwnershipSchema);
  }

  findByOwnerAndToken(user: string, token: string): Promise<TokenOwnership> {
    return this.db.findOne({ ownerId: user, tokenId: token });
  }

  findByOwner(user: string): Promise<TokenOwnership[]> {
    return this.db.find({ ownerId: user });
  }

  findByToken(token: string): Promise<TokenOwnership[]> {
    return this.db.find({ tokenId: token });
  }
}

export default TokenOwnershipRepository;
