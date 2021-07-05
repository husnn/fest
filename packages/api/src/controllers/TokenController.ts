import { NextFunction, Request, Response } from 'express';

import {
    ApproveMint, CreateToken, EthereumService, GetToken, GetTokenOwnership, GetTokenOwnerships,
    IPFSService, TokenRepository, UserRepository, WalletRepository
} from '@fanbase/core';
import { TokenOwnershipRepository } from '@fanbase/postgres';
import {
    ApproveMintResponse, CreateTokenResponse, GetTokenOwnershipResponse, GetTokenOwnershipsResponse,
    GetTokenResponse, Protocol, TokenData
} from '@fanbase/shared';

import { NotFoundError } from '../http';
import HttpResponse from '../http/HttpResponse';

class TokenController {
  private createTokenUseCase: CreateToken;
  private getTokenUseCase: GetToken;
  private approveMintUseCase: ApproveMint;
  private getOwnershipUseCase: GetTokenOwnership;
  private getOwnershipsUseCase: GetTokenOwnerships;

  constructor(
    tokenRepository: TokenRepository,
    metadataStore: IPFSService,
    userRepository: UserRepository,
    walletRepository: WalletRepository,
    ethereumService: EthereumService,
    tokenOwnershipRepository: TokenOwnershipRepository
  ) {
    this.createTokenUseCase = new CreateToken(
      tokenRepository,
      userRepository,
      metadataStore
    );

    this.getTokenUseCase = new GetToken(tokenRepository);

    this.approveMintUseCase = new ApproveMint(
      walletRepository,
      tokenRepository,
      ethereumService
    );

    this.getOwnershipUseCase = new GetTokenOwnership(tokenOwnershipRepository);
    this.getOwnershipsUseCase = new GetTokenOwnerships(
      tokenOwnershipRepository
    );
  }

  async approveMint(req: Request, res: Response) {
    const { token } = req.body;

    const result = await this.approveMintUseCase.exec({
      protocol: Protocol.ETHEREUM,
      user: req.user,
      token
    });

    const { data, expiry, salt, signature } = result.data;

    return new HttpResponse<ApproveMintResponse>(res, {
      data,
      expiry,
      salt,
      signature
    });
  }

  async getOwnerships(req: Request, res: Response, next: NextFunction) {
    const count = req.pagination.count;
    const page = req.pagination.page;

    try {
      const { id } = req.params;

      const response = await this.getOwnershipsUseCase.exec({
        token: id,
        count,
        page
      });

      const { ownerships, total } = response.data;

      return new HttpResponse<GetTokenOwnershipsResponse>(
        res,
        {
          body: ownerships
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

  async getOwnership(req: Request, res: Response, next: NextFunction) {
    try {
      const { ownershipId } = req.params;

      const result = await this.getOwnershipUseCase.exec({
        ownership: ownershipId
      });

      if (!result.success) throw new NotFoundError();

      return new HttpResponse<GetTokenOwnershipResponse>(res, {
        body: result.data
      });
    } catch (err) {
      next(err);
    }
  }

  async getToken(req: Request, res: Response, next: NextFunction) {
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

  async createToken(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        type,
        resource,
        name,
        description,
        image,
        supply,
        fees,
        attributes
      }: TokenData = req.body;

      const result = await this.createTokenUseCase.exec({
        user: req.user,
        type,
        name,
        description,
        supply,
        image,
        resource,
        fees,
        attributes
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
