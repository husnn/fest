import { TokenOwnership } from '@fanbase/shared';

import Repository from './Repository';

export interface TokenOwnershipRepository extends Repository<TokenOwnership> {
  findByOwner(user: string): Promise<TokenOwnership[]>;
  findByToken(token: string): Promise<TokenOwnership[]>;
}

export default TokenOwnershipRepository;
