import UseCase from '../../base/UseCase';
import { PostRepository } from '../../repositories';
import { Result } from '../../Result';

export interface DeletePostInput {
  userId: string;
  postId: string;
}

type DeletePostOutput = any;

export class DeletePost extends UseCase<DeletePostInput, DeletePostOutput> {
  private postRepository: PostRepository;

  constructor(postRepository: PostRepository) {
    super();

    this.postRepository = postRepository;
  }

  async exec(data: DeletePostInput): Promise<Result<DeletePostOutput>> {
    const post = await this.postRepository.get(data.postId);
    if (post.userId != data.userId)
      return Result.fail('User is not post creator.');

    await this.postRepository.remove(post);

    return Result.ok();
  }
}
