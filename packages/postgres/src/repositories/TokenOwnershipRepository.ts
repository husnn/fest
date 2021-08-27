import {
    TokenOwnership, TokenOwnershipRepository as ITokenOwnershipRepository
} from '@fanbase/core';

import TokenOwnershipSchema from '../schemas/TokenOwnershipSchema';
import Repository from './Repository';

export class TokenOwnershipRepository
  extends Repository<TokenOwnership>
  implements ITokenOwnershipRepository
{
  constructor() {
    super(TokenOwnershipSchema);
  }

  findByWalletAndToken(wallet: string, token: string): Promise<TokenOwnership> {
    return this.db.findOne({ walletId: wallet, tokenId: token });
  }

  async findByWallet(
    wallet: string,
    count: number,
    page: number
  ): Promise<{ ownerships: TokenOwnership[]; total: number }> {
    const [ownerships, total] = await this.db
      .createQueryBuilder('ownership')
      .leftJoinAndSelect('ownership.token', 'token')
      .leftJoinAndSelect('token.creator', 'creator')
      .where('ownership.walletId = :wallet', { wallet })
      .andWhere('ownership.quantity > 0')
      .orderBy('token.dateCreated', 'DESC')
      .skip((page - 1) * count)
      .take(count)
      .getManyAndCount();

    return { ownerships, total };
  }

  async findByToken(
    token: string,
    count: number,
    page: number
  ): Promise<{ ownerships: TokenOwnership[]; total: number }> {
    const [ownerships, total] = await this.db
      .createQueryBuilder('ownership')
      .leftJoinAndSelect('ownership.wallet', 'wallet')
      .leftJoinAndMapOne(
        'ownership.owner',
        'user',
        'owner',
        'owner.walletId = ownership.walletId'
      )
      .where('ownership.tokenId = :token', { token })
      .andWhere('ownership.quantity > 0')
      .orderBy('ownership.quantity', 'DESC')
      .addOrderBy('ownership.dateCreated', 'ASC')
      .skip((page - 1) * count)
      .take(count)
      .getManyAndCount();

    return { ownerships, total };
  }
}

export default TokenOwnershipRepository;
