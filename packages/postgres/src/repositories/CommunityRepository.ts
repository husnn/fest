import {
  Community,
  CommunityRepository as ICommunityRepository
} from '@fanbase/core';

import CommunitySchema from '../schemas/CommunitySchema';
import Repository from './Repository';

export class CommunityRepository
  extends Repository<Community>
  implements ICommunityRepository
{
  constructor() {
    super(CommunitySchema);
  }

  async findByToken(id: string): Promise<Community[]> {
    const tokens = await this.db
      .createQueryBuilder('community')
      // .leftJoinAndSelect('community.tokens', 'token', 'token.id = :id', { id })
      .getMany();

    return tokens;
  }
}

export default CommunityRepository;
