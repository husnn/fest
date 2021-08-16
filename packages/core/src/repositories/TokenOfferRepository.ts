import { TokenOffer } from '../entities';
import Repository from './Repository';

export interface TokenOfferRepository extends Repository<TokenOffer> {
  findByReceiver(
    receiver: string,
    count?: number,
    page?: number
  ): Promise<{ offers: TokenOffer[]; total: number }>;
}

export default TokenOfferRepository;
