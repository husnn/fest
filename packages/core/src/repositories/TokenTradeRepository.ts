import { Protocol } from '@fanbase/shared';

import { TokenTrade } from '../entities';
import Repository from './Repository';

export interface TokenTradeRepository extends Repository<TokenTrade> {
  findByChainData(
    protocol: Protocol,
    data: {
      contract: string;
      id: string;
    }
  ): Promise<TokenTrade>;
}

export default TokenTradeRepository;
