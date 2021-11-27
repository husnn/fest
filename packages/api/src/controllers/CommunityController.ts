import {
  CommunityRepository,
  CreateCommunity,
  GetCommunity,
  TokenRepository,
  UserRepository
} from '@fanbase/core';
import { HttpError, HttpResponse } from '../http';
import { NextFunction, Request, Response } from 'express';

import { GetCommunityResponse } from '@fanbase/shared';

export class CommunityController {
  private createCommunityUseCase: CreateCommunity;
  private getCommunityUseCase: GetCommunity;

  constructor(
    tokenRepository: TokenRepository,
    userRepository: UserRepository,
    communityRepository: CommunityRepository
  ) {
    this.createCommunityUseCase = new CreateCommunity(
      tokenRepository,
      communityRepository
    );

    this.getCommunityUseCase = new GetCommunity(
      userRepository,
      communityRepository
    );
  }

  async get(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      const result = await this.getCommunityUseCase.exec({
        id,
        user: req.user
      });
      if (!result.success) throw new HttpError();

      return new HttpResponse<GetCommunityResponse>(res, {
        body: result.data.community
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const tokens = JSON.parse(req.body.tokens);

      const result = await this.createCommunityUseCase.exec({
        creator: req.user,
        name,
        tokens
      });
      if (!result.success) throw new HttpError('Could not create community.');

      return new HttpResponse(res);
    } catch (err) {
      next(err);
    }
  }
}

export default CommunityController;
