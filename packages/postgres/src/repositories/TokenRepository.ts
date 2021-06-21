import { Token, TokenRepository as ITokenRepository } from '@fanbase/core';
import { Protocol } from '@fanbase/shared';

import TokenSchema from '../schemas/TokenSchema';
import Repository from './Repository';

export class TokenRepository
  extends Repository<Token>
  implements ITokenRepository
{
  constructor() {
    super(TokenSchema);
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
