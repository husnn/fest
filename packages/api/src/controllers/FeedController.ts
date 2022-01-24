import {
  CommunityRepository,
  GetUserFeed,
  PostRepository,
  UserRepository
} from '@fest/core';
import { HttpError, HttpResponse } from '../http';
import { NextFunction, Request, Response } from 'express';

import { GetFeedResponse } from '@fest/shared';

class FeedController {
  private getUserFeedUseCase: GetUserFeed;

  constructor(
    userRepository: UserRepository,
    communityRepository: CommunityRepository,
    postRepository: PostRepository
  ) {
    this.getUserFeedUseCase = new GetUserFeed(
      userRepository,
      communityRepository,
      postRepository
    );
  }

  async getFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const { cursor } = req.body;

      const result = await this.getUserFeedUseCase.exec({
        userId: req.user,
        cursor: cursor as string
      });
      if (!result.success) throw new HttpError('Could not get user feed.');

      return new HttpResponse<GetFeedResponse>(res, {
        body: result.data.posts,
        cursor: result.data.cursor
      });
    } catch (err) {
      next(err);
    }
  }
}

export default FeedController;
