import { NextFunction, Request, Response } from 'express';

import {
    ApproveMint, ApproveTokenSale, CreateToken, EthereumService, GetToken, GetTokenOwnership,
    GetTokenOwnerships, GetYouTubeChannel, GoogleService, IPFSService, ListTokenForSale,
    MediaService, MintToken, OAuthRepository, TokenOwnershipRepository, TokenRepository,
    UserRepository, WalletRepository, YouTubeService
} from '@fanbase/core';
import {
    ApproveMintResponse, ApproveTokenSaleResponse, CreateTokenResponse,
    GetSignedTokenImageUploadUrlResponse, GetTokenOwnershipResponse, GetTokenOwnershipsResponse,
    GetTokenResponse, ListTokenForSaleResponse, MintTokenResponse, TokenData
} from '@fanbase/shared';

import { HttpError, NotFoundError } from '../http';
import HttpResponse from '../http/HttpResponse';

class TokenController {
  private createTokenUseCase: CreateToken;
  private getTokenUseCase: GetToken;
  private approveMintUseCase: ApproveMint;
  private mintTokenUseCase: MintToken;
  private getOwnershipUseCase: GetTokenOwnership;
  private getOwnershipsUseCase: GetTokenOwnerships;

  private approveTokenSaleUseCase: ApproveTokenSale;
  private listTokenForSaleUseCase: ListTokenForSale;

  private mediaService: MediaService;

  constructor(
    tokenRepository: TokenRepository,
    mediaService: MediaService,
    metadataStore: IPFSService,
    userRepository: UserRepository,
    walletRepository: WalletRepository,
    ethereumService: EthereumService,
    tokenOwnershipRepository: TokenOwnershipRepository,
    oAuthRepository: OAuthRepository,
    googleService: GoogleService,
    youtubeService: YouTubeService
  ) {
    this.mediaService = mediaService;

    const getYouTubeChannelUseCase = new GetYouTubeChannel(
      oAuthRepository,
      googleService,
      youtubeService
    );

    this.createTokenUseCase = new CreateToken(
      tokenRepository,
      userRepository,
      mediaService,
      metadataStore,
      youtubeService,
      getYouTubeChannelUseCase
    );

    this.getTokenUseCase = new GetToken(tokenRepository);

    this.approveMintUseCase = new ApproveMint(
      walletRepository,
      tokenRepository,
      ethereumService
    );

    this.mintTokenUseCase = new MintToken(
      walletRepository,
      tokenRepository,
      ethereumService
    );

    this.getOwnershipUseCase = new GetTokenOwnership(tokenOwnershipRepository);
    this.getOwnershipsUseCase = new GetTokenOwnerships(
      tokenOwnershipRepository
    );

    this.approveTokenSaleUseCase = new ApproveTokenSale(
      walletRepository,
      tokenRepository,
      tokenOwnershipRepository,
      ethereumService
    );

    this.listTokenForSaleUseCase = new ListTokenForSale(
      walletRepository,
      tokenRepository,
      tokenOwnershipRepository,
      ethereumService
    );
  }

  async listForSale(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const { quantity, price } = req.body;

      const result = await this.listTokenForSaleUseCase.exec({
        user: req.user,
        token: id,
        quantity,
        price
      });

      if (!result.success)
        throw new HttpError('Could not list token for sale.');

      return new HttpResponse<ListTokenForSaleResponse>(res, {
        txHash: result.data.txHash
      });
    } catch (err) {
      next(err);
    }
  }

  async approveSale(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { quantity, price } = req.body;

      const result = await this.approveTokenSaleUseCase.exec({
        user: req.user,
        token: id,
        quantity,
        price
      });

      if (!result.success) throw new HttpError('Could not approve token sale.');

      const { expiry, salt, signature } = result.data;

      return new HttpResponse<ApproveTokenSaleResponse>(res, {
        expiry,
        salt,
        signature
      });
    } catch (err) {
      next(err);
    }
  }

  async mint(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { protocol } = req.body;

      const result = await this.mintTokenUseCase.exec({
        protocol,
        user: req.user,
        token: id
      });

      if (!result.success) throw new HttpError('Could not mint token.');

      return new HttpResponse<MintTokenResponse>(res, {
        txHash: result.data.txHash
      });
    } catch (err) {
      next(err);
    }
  }

  async approveMint(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { protocol } = req.body;

    const result = await this.approveMintUseCase.exec({
      protocol,
      user: req.user,
      token: id
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
        royaltyPct,
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
        royaltyPct,
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

  async getSignedTokenMediaUploadUrl(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await this.mediaService.getSignedImageUploadUrl(
        req.query.filename as string,
        req.query.filetype as string,
        Number(req.query.filesize)
      );

      if (!result.success) throw new HttpError('Could not create upload URL.');

      const { signedUrl, url } = result.data;

      return new HttpResponse<GetSignedTokenImageUploadUrlResponse>(res, {
        signedUrl,
        url
      });
    } catch (err) {
      next(err);
    }
  }
}

export default TokenController;
