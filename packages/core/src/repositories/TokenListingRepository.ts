import { Protocol } from '@fanbase/shared';

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
}

export default TokenListingRepository;
