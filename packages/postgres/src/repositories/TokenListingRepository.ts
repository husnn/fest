import { TokenListing, TokenListingRepository as ITokenListingRepository } from '@fanbase/core';
import { Protocol, TokenListingStatus } from '@fanbase/shared';

import TokenListingSchema from '../schemas/TokenListingSchema';
import Repository from './Repository';

export class TokenListingRepository
  extends Repository<TokenListing>
  implements ITokenListingRepository
{
  constructor() {
    super(TokenListingSchema);
  }

  async findBySeller(
    seller: string,
    options?: { onlyActive: boolean },
    count = 10,
    page = 1
  ): Promise<{ listings: TokenListing[]; total: number }> {
    const query = this.db
      .createQueryBuilder('token_listing')
      .leftJoinAndSelect('token_listing.token', 'token')
      .where('token_listing.sellerId = :seller', { seller })
      .skip((page - 1) * count)
      .take(count);

    if (options?.onlyActive) {
      query.andWhere('token_listing.status = :status', {
        status: TokenListingStatus.Active
      });
    }

    const [listings, total] = await query.getManyAndCount();

    return { listings, total };
  }

  async findByToken(
    tokenId: string,
    options?: { onlyActive: boolean },
    count = 10,
    page = 1
  ): Promise<{ listings: TokenListing[]; total: number }> {
    const query = this.db
      .createQueryBuilder('token_listing')
      .leftJoinAndSelect('token_listing.seller', 'seller')
      .leftJoinAndSelect('seller.wallet', 'wallet')
      .where('token_listing.tokenId = :tokenId', { tokenId })
      .orderBy('token_listing.dateCreated', 'DESC')
      .skip((page - 1) * count)
      .take(count);

    if (options?.onlyActive) {
      query.andWhere('token_listing.status = :status', {
        status: TokenListingStatus.Active
      });
    }

    const [listings, total] = await query.getManyAndCount();

    return { listings, total };
  }

  async findByChainData(
    protocol: Protocol,
    data: { contract: string; id: string }
  ): Promise<TokenListing> {
    const token = await this.db
      .createQueryBuilder('trade')
      .where('trade.protocol = :protocol', { protocol })
      .andWhere('trade.chain @> :data', { data })
      .getOne();

    return token;
  }
}

export default TokenListingRepository;
