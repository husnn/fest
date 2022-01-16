import { Post, generatePostId } from '@fanbase/core';
import { PostRepository, UserRepository } from '../../repositories';

import { PostDTO } from '@fanbase/shared';
import { Result } from '../../Result';
import UseCase from '../../base/UseCase';

export interface CreatePostInput {
  userId: string;
  text: string;
  media: string[];
  communityId: string;
}

export interface CreatePostOutput {
  post: PostDTO;
}

export class CreatePost extends UseCase<CreatePostInput, CreatePostOutput> {
  private userRepository: UserRepository;
  private postRepository: PostRepository;

  constructor(userRepository: UserRepository, postRepository: PostRepository) {
    super();

    this.userRepository = userRepository;
    this.postRepository = postRepository;
  }

  async exec(data: CreatePostInput): Promise<Result<CreatePostOutput>> {
    const post = new Post({
      id: generatePostId()(),
      communityId: data.communityId,
      userId: data.userId,
      text: data.text,
      media: data.media?.map((m) => {
        return {
          sourceUrl: m,
          isVideo: false
        };
      })
    });

    await this.postRepository.create(post);

    return Result.ok({ post: new PostDTO(post) });
  }
}
