import {
  Community,
  CommunityRepository as ICommunityRepository
} from '@fest/core';
import { getManager, getRepository } from 'typeorm';

import CommunitySchema from '../schemas/CommunitySchema';
import Repository from './Repository';
import UserSchema from '../schemas/UserSchema';

export class CommunityRepository
  extends Repository<Community>
  implements ICommunityRepository
{
  constructor() {
    super(CommunitySchema);
  }

  async addUserForToken(userId: string, tokenId: string): Promise<void> {
    try {
      const user = await getRepository(UserSchema).findOne(userId);
      if (!user) return;

      const communities = await this.findByToken(tokenId);

      await getManager().transaction(async (manager) => {
        for await (const community of communities) {
          await manager
            .getRepository(CommunitySchema)
            .createQueryBuilder('community')
            .relation('users')
            .of(community)
            .add(user);
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  async removeUserForToken(userId: string, tokenId: string): Promise<void> {
    try {
      const user = await getRepository(UserSchema).findOne(userId);
      if (!user) return;

      const communities = await this.findByToken(tokenId);

      await getManager().transaction(async (manager) => {
        for await (const community of communities) {
          await manager
            .getRepository(CommunitySchema)
            .createQueryBuilder('community')
            .relation('users')
            .of(community)
            .remove(user);
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  async getAllForUser(
    userId: string,
    count: number,
    page: number
  ): Promise<{ communities: Community[]; total: number }> {
    const [communities, total] = await this.db
      .createQueryBuilder('community')
      .leftJoin('community.users', 'user')
      .where('user.id = :userId', { userId })
      .skip((page - 1) * count)
      .take(count)
      .getManyAndCount();

    return { communities, total };
  }

  async getForUser(id: string, user: string): Promise<[Community, boolean]> {
    const community = await this.db
      .createQueryBuilder('community')
      .leftJoinAndSelect('community.users', 'user', 'user.id = :user', { user })
      .where('community.id = :id', { id })
      .getOne();

    return [
      community,
      community.users.length > 0 || community.creatorId == user
    ];
  }

  async findByToken(id: string): Promise<Community[]> {
    const tokens = await this.db
      .createQueryBuilder('community')
      .innerJoin('community.tokens', 'token')
      .where('token.id = :id', { id })
      .getMany();

    return tokens;
  }
}

export default CommunityRepository;
