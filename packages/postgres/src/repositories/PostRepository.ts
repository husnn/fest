import { PostRepository as IPostRepository, Post } from '@fest/core';

import PostSchema from '../schemas/PostSchema';
import Repository from './Repository';

export class PostRepository
  extends Repository<Post>
  implements IPostRepository
{
  constructor() {
    super(PostSchema);
  }

  async getForCommunities(
    communityIds: string[],
    before: Date,
    count?: number
  ): Promise<Post[]> {
    return this.db
      .createQueryBuilder('post')
      .where('post.community_id IN (:...communityIds)', { communityIds })
      .andWhere('post.date_created < :before', { before })
      .leftJoinAndSelect('post.community', 'community')
      .leftJoin('post.user', 'user')
      .addSelect(['user.id', 'user.username', 'user.name'])
      .orderBy('post.date_created', 'DESC')
      .limit(count)
      .getMany();
  }
}
