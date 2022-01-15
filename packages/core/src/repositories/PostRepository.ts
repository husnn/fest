import Post from '../entities/Post';
import { Repository } from '.';

export interface PostRepository extends Repository<Post> {
  getForCommunities(
    communityIds: string[],
    before?: Date,
    count?: number
  ): Promise<Post[]>;
}
