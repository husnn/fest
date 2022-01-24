import { Protocol } from '@fest/shared';

import { TokenListing } from '../entities';
import Repository from './Repository';

export interface TokenListingRepository extends Repository<TokenListing> {
  findByChainData(
    protocol: Protocol,
    data: {
      contract: string;
      id: string;
    }
  ): Promise<TokenListing>;

  findByToken(
    tokenId: string,
    options?: { onlyActive: boolean },
    count?: number,
    page?: number
  ): Promise<{ listings: TokenListing[]; total: number }>;

  findBySeller(
    seller: string,
    options?: { onlyActive: boolean },
    count?: number,
    page?: number
  ): Promise<{ listings: TokenListing[]; total: number }>;
}

export default TokenListingRepository;
