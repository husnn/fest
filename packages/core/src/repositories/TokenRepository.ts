import { Protocol } from '@fanbase/shared';
import Repository from './Repository';
import { Token } from '../entities';

export interface TokenRepository extends Repository<Token> {
  findByChainData(data: {
    protocol: Protocol;
    contract: string;
    id: string;
  }): Promise<Token>;

  findByCreator(
    user: string,
    count: number,
    page: number
  ): Promise<{ tokens: Token[]; total: number }>;
}

export default TokenRepository;
