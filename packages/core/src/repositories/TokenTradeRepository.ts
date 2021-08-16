import { TokenTrade } from '../entities';
import Repository from './Repository';

export interface TokenTradeRepository extends Repository<TokenTrade> {
  findByBuyer(
    buyer: string,
    count?: number,
    page?: number
  ): Promise<{ orders: TokenTrade[]; total: number }>;
}

export default TokenTradeRepository;
