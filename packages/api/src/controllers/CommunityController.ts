import {
  CommunityRepository,
  CreateCommunity,
  GetCommunity,
  GetCommunityToken,
  TokenRepository,
  UserRepository
} from '@fest/core';
import { GetCommunityResponse, GetCommunityTokenResponse } from '@fest/shared';
import { HttpError, HttpResponse } from '../http';
import { NextFunction, Request, Response } from 'express';

export class CommunityController {
  private createCommunityUseCase: CreateCommunity;
  private getCommunityUseCase: GetCommunity;
  private getCommunityTokenUseCase: GetCommunityToken;

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

    this.getCommunityTokenUseCase = new GetCommunityToken(
      this.getCommunityUseCase
    );
  }

  async getToken(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      if (!id) throw new HttpError('Missing community ID.');

      const result = await this.getCommunityTokenUseCase.exec({
        user: req.user,
        community: id
      });
      if (!result.success)
        throw new HttpError('Could not get chat token for community.');

      return new HttpResponse<GetCommunityTokenResponse>(res, {
        token: result.data.token
      });
    } catch (err) {
      next(err);
    }
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
        body: result.data.community,
        token: result.data.token
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
