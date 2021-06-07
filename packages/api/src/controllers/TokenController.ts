import { NextFunction, Request, Response } from 'express';

import {
  ApproveMint, CreateToken, EthereumService, GetToken, TokenRepository, UserRepository,
  WalletRepository
} from '@fanbase/core';
import { ApproveMintResponse, CreateTokenResponse, Protocol, TokenData } from '@fanbase/shared';
import { GetTokenResponse } from '@fanbase/shared/src/types';

import { NotFoundError } from '../http';
import HttpResponse from '../http/HttpResponse';

class TokenController {
  private createTokenUseCase: CreateToken;
  private getTokenUseCase: GetToken;
  private approveMintUseCase: ApproveMint;

  constructor (
    tokenRepository: TokenRepository,
    userRepository: UserRepository,
    walletRepository: WalletRepository,
    ethereumService: EthereumService
  ) {
    this.createTokenUseCase = new CreateToken(tokenRepository, userRepository);

    this.getTokenUseCase = new GetToken(tokenRepository);

    this.approveMintUseCase = new ApproveMint(
      walletRepository,
      ethereumService
    );
  }

  async approveMint (req: Request, res: Response, next: NextFunction) {
    const { supply } = req.body;

    const result = await this.approveMintUseCase.exec({
      protocol: Protocol.ETHEREUM,
      user: req.user,
      supply
    });

    const { data, signature, salt } = result.data;

    return new HttpResponse<ApproveMintResponse>(res, {
      data,
      signature,
      salt
    });
  }

  async getToken (req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.getTokenUseCase.exec({ id });

      if (!result.success) throw new NotFoundError();

      const { token } = result.data;

      return new HttpResponse<GetTokenResponse>(res, { token });
    } catch (err) {
      next(err);
    }
  }

  async createToken (req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, supply }: TokenData = req.body;

      const metadata = '';

      const result = await this.createTokenUseCase.exec({
        user: req.user,
        supply,
        metadata
      });

      return new HttpResponse<CreateTokenResponse>(res, {
        body: {
          token: result.data
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

export default TokenController;
