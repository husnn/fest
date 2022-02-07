import { PostDTO } from '@fest/shared';
import UseCase from '../../base/UseCase';
import {
  CommunityRepository,
  PostRepository,
  UserRepository
} from '../../repositories';
import Result from '../../Result';
import { decodeCursor, encodeCursor } from '../../utils/cursor';

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
    if (communityQuery.total < 1)
      return Result.ok({
        posts: []
      });

    const posts = await this.postRepository.getForCommunities(
      communityQuery.communities.map((c) => c.id),
      data.cursor ? new Date(decodeCursor(data.cursor)) : new Date(),
      20
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
