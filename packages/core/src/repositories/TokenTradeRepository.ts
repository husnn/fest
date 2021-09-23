import { TokenTrade } from '../entities';
import Repository from './Repository';

export interface TokenTradeRepository extends Repository<TokenTrade> {
  findByBuyerOrSeller(
    user: string,
    options?: { join?: Array<{ property: string; alias: string }> },
    count?: number,
    page?: number
  ): Promise<{ trades: TokenTrade[]; total: number }>;

  findByBuyer(
    buyer: string,
    options?: { join?: Array<keyof TokenTrade> },
    count?: number,
    page?: number
  ): Promise<{ trades: TokenTrade[]; total: number }>;
}

export default TokenTradeRepository;
