import { NextFunction, Request, Response } from 'express';

import {
    EditUser, EthereumService, GetTokensCreated, GetUser, MailService, TokenRepository,
    UserRepository, WalletRepository
} from '@fanbase/core';
import { GetTokensCreatedResponse, GetUserResponse } from '@fanbase/shared';
import { EditUserResponse, UserInfo } from '@fanbase/shared/src/types';

import { HttpError, HttpResponse, NotFoundError, ValidationError } from '../http';

class UserController {
  private editUserUseCase: EditUser;
  private getUserUseCase: GetUser;
  private getTokensCreatedUseCase: GetTokensCreated;

  constructor(
    userRepository: UserRepository,
    walletRepository: WalletRepository,
    tokenRepository: TokenRepository,
    ethereumService: EthereumService,
    mailService: MailService
  ) {
    this.editUserUseCase = new EditUser(userRepository, walletRepository);
    this.getUserUseCase = new GetUser(userRepository, walletRepository);
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

      if (Object.keys(data).length === 0)
        throw new ValidationError('No changes were made.');

      const result = await this.editUserUseCase.exec({
        user: req.user,
        ...data
      });

      if (!result.success) throw new HttpError();

      const { user } = result.data;

      return new HttpResponse<EditUserResponse>(res, {
        user
      });
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
