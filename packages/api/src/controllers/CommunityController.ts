import {
  CommunityRepository,
  CreateCommunity,
  TokenRepository
} from '@fanbase/core';
import { HttpError, HttpResponse } from '../http';
import { NextFunction, Request, Response } from 'express';

export class CommunityController {
  private createCommunityUseCase: CreateCommunity;

  constructor(
    tokenRepository: TokenRepository,
    communityRepository: CommunityRepository
  ) {
    this.createCommunityUseCase = new CreateCommunity(
      tokenRepository,
      communityRepository
    );
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
