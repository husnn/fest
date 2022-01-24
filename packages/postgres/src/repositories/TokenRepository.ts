import { TokenRepository as ITokenRepository, Token } from '@fest/core';

import { Protocol } from '@fest/shared';
import Repository from './Repository';
import TokenSchema from '../schemas/TokenSchema';

export class TokenRepository
  extends Repository<Token>
  implements ITokenRepository
{
  constructor() {
    super(TokenSchema);
  }

  async findByFeeReceiver(
    data: [{ walletId: string }],
    count: number,
    page: number
  ): Promise<{ tokens: Token[]; total: number }> {
    const [tokens, total] = await this.db
      .createQueryBuilder('token')
      .where('token.fees ::jsonb @> :data', {
        data: JSON.stringify(data)
      })
      .skip((page - 1) * count)
      .take(count)
      .getManyAndCount();

    return { tokens, total };
  }

  async findByChainData(data: {
    protocol?: Protocol;
    contract?: string;
    id?: string;
  }): Promise<Token> {
    const token = await this.db
      .createQueryBuilder('token')
      .where('token.chain @> :data', { data })
      .getOne();

    return token;
  }

  async findByCreator(
    user: string,
    count: number,
    page: number
  ): Promise<{ tokens: Token[]; total: number }> {
    const [tokens, total] = await this.db
      .createQueryBuilder('token')
      .where('token.creatorId = :user', { user })
      .orderBy('token.dateCreated', 'DESC')
      .skip((page - 1) * count)
      .take(count)
      .getManyAndCount();

    return { tokens, total };
  }
}

export default TokenRepository;
