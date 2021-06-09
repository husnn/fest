import { NextFunction, Request, Response } from 'express';

import {
    EthereumService, GetTokensCreated, GetUser, MailService, TokenRepository, UserRepository,
    WalletRepository
} from '@fanbase/core';
import { GetTokensCreatedResponse, GetUserResponse } from '@fanbase/shared';
import { UserInfo } from '@fanbase/shared/src/types';

import { HttpResponse, NotFoundError, ValidationError } from '../http';

class UserController {
  private getUserUseCase: GetUser;
  private getTokensCreatedUseCase: GetTokensCreated;

  constructor(
    userRepository: UserRepository,
    walletRepository: WalletRepository,
    tokenRepository: TokenRepository,
    ethereumService: EthereumService,
    mailService: MailService
  ) {
    this.getUserUseCase = new GetUser(userRepository);
    this.getTokensCreatedUseCase = new GetTokensCreated(tokenRepository);
  }

  async getTokensCreated(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tokens = await this.getTokensCreatedUseCase.exec({ user: id });
      return new HttpResponse<GetTokensCreatedResponse>(res, {
        body: {
          tokens: tokens.data
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async editUser(req: Request, res: Response, next: NextFunction) {
    try {
      const data: UserInfo = req.body;

      if (!data.username) throw new ValidationError('Missing username.');
    } catch (err) {
      next(err);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, username } = req.query as any;

      const result = await this.getUserUseCase.exec({ id, username });

      if (!result.success) throw new NotFoundError();

      return new HttpResponse<GetUserResponse>(res, {
        user: result.data
      });
    } catch (err) {
      next(err);
    }
  }
}

export default UserController;
