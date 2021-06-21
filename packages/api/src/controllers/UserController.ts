import { NextFunction, Request, Response } from 'express';

import {
    EditUser, GetTokensCreated, GetUser, TokenRepository, UserRepository, WalletRepository
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
    tokenRepository: TokenRepository
  ) {
    this.editUserUseCase = new EditUser(userRepository, walletRepository);
    this.getUserUseCase = new GetUser(userRepository, walletRepository);
    this.getTokensCreatedUseCase = new GetTokensCreated(tokenRepository);
  }

  async getTokensCreated(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<HttpResponse<GetTokensCreatedResponse>> {
    const count = req.pagination.count;
    const page = req.pagination.page;

    try {
      const { id } = req.params;

      const response = await this.getTokensCreatedUseCase.exec({
        user: id,
        count,
        page
      });

      const { tokens, total } = response.data;

      return new HttpResponse<GetTokensCreatedResponse>(
        res,
        {
          body: tokens
        },
        {
          count,
          page,
          total
        }
      );
    } catch (err) {
      next(err);
    }
  }

  async editUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<HttpResponse<EditUserResponse>> {
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

  async get(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<HttpResponse<GetUserResponse>> {
    try {
      const { id } = req.params;
      const username = req.query.username as string;

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
