import { MediaService } from '../../services';
import { PostRepository } from '../../repositories';
import { Result } from '@fest/shared';
import UseCase from '../../base/UseCase';

export interface DeletePostInput {
  userId: string;
  postId: string;
}

type DeletePostOutput = any;

export class DeletePost extends UseCase<DeletePostInput, DeletePostOutput> {
  private postRepository: PostRepository;
  private mediaService: MediaService;

  constructor(postRepository: PostRepository, mediaService: MediaService) {
    super();

    this.postRepository = postRepository;
    this.mediaService = mediaService;
  }

  async exec(data: DeletePostInput): Promise<Result<DeletePostOutput>> {
    const post = await this.postRepository.get(data.postId);
    if (post.userId != data.userId)
      return Result.fail('User is not post creator.');

    await this.postRepository.remove(post);

    for (const m of post.media) {
      const key = this.mediaService.getKeyFromUrl(m.sourceUrl);
      if (!key) continue;

      this.mediaService.deleteFile(key);
    }

    return Result.ok();
  }
}
