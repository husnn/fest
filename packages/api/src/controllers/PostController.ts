import {
  CreatePost,
  DeletePost,
  MediaService,
  PostRepository,
  UserRepository
} from '@fest/core';
import {
  GetPostMediaUploadURLsResponse,
  PostMediaUploadData
} from '@fest/shared';
import { NextFunction, Request, Response } from 'express';
import { HttpError, HttpResponse, ValidationError } from '../http';

class PostController {
  private createPostUseCase: CreatePost;
  private deletePostUseCase: DeletePost;

  private mediaService: MediaService;

  constructor(
    userRepository: UserRepository,
    postRepository: PostRepository,
    mediaService: MediaService
  ) {
    this.createPostUseCase = new CreatePost(userRepository, postRepository);
    this.deletePostUseCase = new DeletePost(postRepository);
    this.mediaService = mediaService;
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = req.params.id;
      if (!postId) throw new ValidationError('Missing post id.');

      const result = await this.deletePostUseCase.exec({
        userId: req.user,
        postId
      });
      if (!result.success) throw new HttpError('Could not delete post.');

      return new HttpResponse(res);
    } catch (err) {
      next(err);
    }
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
      if (!text && media?.length < 1)
        throw new HttpError('Missing post content.');
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
