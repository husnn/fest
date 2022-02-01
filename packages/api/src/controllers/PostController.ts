import {
  CreatePost,
  MediaService,
  PostRepository,
  UserRepository
} from '@fest/core';
import {
  GetPostMediaUploadURLsResponse,
  PostMediaUploadData
} from '@fest/shared';
import { HttpError, HttpResponse } from '../http';
import { NextFunction, Request, Response } from 'express';

class PostController {
  private createPostUseCase: CreatePost;

  private mediaService: MediaService;

  constructor(
    userRepository: UserRepository,
    postRepository: PostRepository,
    mediaService: MediaService
  ) {
    this.createPostUseCase = new CreatePost(userRepository, postRepository);
    this.mediaService = mediaService;
  }

  async getMediaUploadURLs(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as PostMediaUploadData[];

      const response: Array<{
        url: string;
        signedUrl: string;
      }> = [];

      for (const media of data) {
        const result = await this.mediaService.getSignedImageUploadUrl(
          MediaService.basePath.posts,
          media.name,
          media.type,
          media.size
        );

        if (!result.success)
          throw new HttpError('Could not create upload URL.');

        response.push(result.data);
      }

      return new HttpResponse<GetPostMediaUploadURLsResponse>(res, {
        body: response
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { text, media, community } = req.body;
      if (!text && !media) throw new HttpError('Missing post content.');
      if (!community) throw new HttpError('Missing community ID.');

      const result = await this.createPostUseCase.exec({
        userId: req.user,
        text,
        media,
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
