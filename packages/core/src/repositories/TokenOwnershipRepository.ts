import { TokenOwnership } from '../entities';
import Repository from './Repository';

export interface TokenOwnershipRepository extends Repository<TokenOwnership> {
  findByWalletAndToken(wallet: string, token: string): Promise<TokenOwnership>;
  findByWallet(
    wallet: string,
    count: number,
    page: number
  ): Promise<{ ownerships: TokenOwnership[]; total: number }>;
  findByToken(
    token: string,
    count: number,
    page: number
  ): Promise<{ ownerships: TokenOwnership[]; total: number }>;
}

export default TokenOwnershipRepository;
