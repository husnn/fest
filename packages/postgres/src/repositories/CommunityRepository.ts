import {
  Community,
  CommunityRepository as ICommunityRepository
} from '@fanbase/core';

import CommunitySchema from '../schemas/CommunitySchema';
import Repository from './Repository';
import TokenOwnershipSchema from '../schemas/TokenOwnershipSchema';
import WalletSchema from '../schemas/WalletSchema';
import { createQueryBuilder } from 'typeorm';

export class CommunityRepository
  extends Repository<Community>
  implements ICommunityRepository
{
  constructor() {
    super(CommunitySchema);
  }

  async findForUser(
    user: string,
    count: number,
    page: number
  ): Promise<{ communities: Community[]; total: number }> {
    const wallet = await createQueryBuilder(WalletSchema, 'wallet')
      .where('wallet.ownerId = :user', { user })
      .getOne();

    const ownerships = await createQueryBuilder(
      TokenOwnershipSchema,
      'ownership'
    )
      .where('ownership.walletId = :walletId', { walletId: wallet?.id })
      .getMany();

    const tokenIds = ownerships.map((o) => o.tokenId);

    const [communities, total] = await this.db
      .createQueryBuilder('community')
      .innerJoin('community.tokens', 'token')
      .where('token.id IN (:...tokenIds)', { tokenIds })
      .skip((page - 1) * count)
      .take(count)
      .getManyAndCount();

    return { communities, total };
  }

  async getForUser(id: string, user: string): Promise<[Community, boolean]> {
    const community = await this.db
      .createQueryBuilder('community')
      .where('community.id = :id', { id })
      .leftJoinAndSelect('community.tokens', 'tokens')
      .getOne();

    const tokenIds = community.tokens.map((token) => token.id);

    const wallet = await createQueryBuilder(WalletSchema, 'wallet')
      .where('wallet.ownerId = :user', { user })
      .getOne();

    const ownership = await createQueryBuilder(
      TokenOwnershipSchema,
      'ownership'
    )
      .where('ownership.tokenId IN (:...tokenIds)', { tokenIds })
      .andWhere('ownership.walletId = :walletId', { walletId: wallet?.id })
      .getOne();

    return [community, community?.creatorId == user || ownership?.quantity > 0];
  }

  async findByToken(id: string): Promise<Community[]> {
    const tokens = await this.db
      .createQueryBuilder('community')
      .leftJoinAndSelect('community.tokens', 'token', 'token.id = :id', { id })
      .getMany();

    return tokens;
  }
}

export default CommunityRepository;
