import {
  CommunityRepository,
  PostRepository,
  UserRepository
} from '../../repositories';
import { decodeCursor, encodeCursor } from '../../utils/cursor';

import { PostDTO } from '@fest/shared';
import Result from '../../Result';
import UseCase from '../../base/UseCase';

type GetUserFeedInput = {
  userId: string;
  cursor?: string;
};

type GetUserFeedOutput = {
  posts: PostDTO[];
  cursor?: string;
};

export class GetUserFeed extends UseCase<GetUserFeedInput, GetUserFeedOutput> {
  private userRepository: UserRepository;
  private communityRepository: CommunityRepository;
  private postRepository: PostRepository;

  constructor(
    userRepository: UserRepository,
    communityRepository: CommunityRepository,
    postRepository: PostRepository
  ) {
    super();

    this.userRepository = userRepository;
    this.communityRepository = communityRepository;
    this.postRepository = postRepository;
  }

  async exec(data: GetUserFeedInput): Promise<Result<GetUserFeedOutput>> {
    const communityQuery = await this.communityRepository.getAllForUser(
      data.userId,
      100,
      1
    );

    const posts = await this.postRepository.getForCommunities(
      communityQuery.communities.map((c) => c.id),
      data.cursor ? new Date(decodeCursor(data.cursor)) : new Date(),
      10
    );

    return Result.ok({
      posts: posts.map((p) => new PostDTO(p)),
      cursor:
        posts.length > 0
          ? encodeCursor(posts[posts.length - 1].dateCreated.toString())
          : null
    });
  }
}
