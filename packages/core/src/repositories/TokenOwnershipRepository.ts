import { TokenOwnership } from '../entities';
import Repository from './Repository';

export interface TokenOwnershipRepository extends Repository<TokenOwnership> {
  findByOwnerAndToken(user: string, token: string): Promise<TokenOwnership>;

  findByOwner(user: string): Promise<TokenOwnership[]>;

  findByToken(token: string): Promise<TokenOwnership[]>;
}

export default TokenOwnershipRepository;
