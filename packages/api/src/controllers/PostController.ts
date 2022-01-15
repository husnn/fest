import { CreatePost, PostRepository, UserRepository } from '@fanbase/core';
import { HttpError, HttpResponse } from '../http';
import { NextFunction, Request, Response } from 'express';

class PostController {
  private createPostUseCase: CreatePost;

  constructor(userRepository: UserRepository, postRepository: PostRepository) {
    this.createPostUseCase = new CreatePost(userRepository, postRepository);
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { text, media, community } = req.body;
      if (!text && !media) throw new HttpError('Missing post content.');
      if (!community) throw new HttpError('Missing community ID.');

      const result = await this.createPostUseCase.exec({
        userId: req.user,
        text,
        communityId: community
      });
      if (!result.success) throw new HttpError('Could not create post.');

      return new HttpResponse(res, { body: result.data.post });
    } catch (err) {
      next(err);
    }
  }
}

export default PostController;
