import {
  CommunityRepository,
  EditUser,
  EnableCreatorMode,
  GetCommunitiesForUser,
  GetReferralSummary,
  GetTokensCreated,
  GetTokensOwned,
  GetUser,
  InviteError,
  InviteRepository,
  TokenOwnershipRepository,
  TokenRepository,
  UserRepository,
  WalletRepository
} from '@fest/core';
import {
  EditUserResponse,
  EnableCreatorModeResponse,
  GetReferralSummaryResponse,
  GetTokensCreatedResponse,
  GetTokensOwnedResponse,
  GetUserCommunitiesResponse,
  GetUserResponse,
  UserInfo
} from '@fest/shared';
import {
  HttpError,
  HttpResponse,
  NotFoundError,
  ValidationError
} from '../http';
import { NextFunction, Request, Response } from 'express';

class UserController {
  private editUserUseCase: EditUser;
  private getUserUseCase: GetUser;
  private getCommunitiesForUserUseCase: GetCommunitiesForUser;
  private getTokensOwnedUseCase: GetTokensOwned;
  private getTokensCreatedUseCase: GetTokensCreated;
  private enableCreatorModeUseCase: EnableCreatorMode;
  private getReferralSummaryUseCase: GetReferralSummary;

  constructor(
    userRepository: UserRepository,
    walletRepository: WalletRepository,
    tokenRepository: TokenRepository,
    tokenOwnershipRepository: TokenOwnershipRepository,
    inviteRepository: InviteRepository,
    communityRepository: CommunityRepository
  ) {
    this.editUserUseCase = new EditUser(userRepository, walletRepository);
    this.getUserUseCase = new GetUser(userRepository, walletRepository);
    this.getTokensCreatedUseCase = new GetTokensCreated(tokenRepository);
    this.getTokensOwnedUseCase = new GetTokensOwned(
      userRepository,
      tokenOwnershipRepository
    );
    this.enableCreatorModeUseCase = new EnableCreatorMode(
      userRepository,
      inviteRepository
    );
    this.getReferralSummaryUseCase = new GetReferralSummary(
      userRepository,
      inviteRepository
    );
    this.getCommunitiesForUserUseCase = new GetCommunitiesForUser(
      communityRepository
    );
  }

  async getCommunities(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<HttpResponse<GetUserCommunitiesResponse>> {
    const count = req.pagination.count;
    const page = req.pagination.page;

    try {
      const { id } = req.params;

      const response = await this.getCommunitiesForUserUseCase.exec({
        user: id,
        count,
        page
      });

      const { communities, total } = response.data;

      return new HttpResponse<GetUserCommunitiesResponse>(
        res,
        {
          body: communities
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

  async getReferralSummary(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<HttpResponse<GetReferralSummaryResponse>> {
    try {
      const result = await this.getReferralSummaryUseCase.exec({
        user: req.user
      });
      if (!result.success)
        throw new HttpError('Could not get referral summary.');

      return new HttpResponse<GetReferralSummaryResponse>(res, {
        invites: result.data.invites
      });
    } catch (err) {
      next(err);
    }
  }

  async enableCreatorMode(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<HttpResponse<EnableCreatorModeResponse>> {
    try {
      const { code } = req.body;

      const result = await this.enableCreatorModeUseCase.exec({
        user: req.user,
        code
      });
      if (!result.success) {
        switch (result.error) {
          case InviteError.INVITE_NOT_FOUND:
            throw new HttpError('Could not find invite code.');
          case InviteError.INVITE_INVALID:
            throw new HttpError('Invite is expired or has already been used.');
          case InviteError.USER_INELIGIBLE:
            throw new HttpError("You're not allowed to use this code.");
          case InviteError.OWN_CODE:
            throw new HttpError('You cannot use your own invite code.');
          default:
            throw new HttpError();
        }
      }

      return new HttpResponse<EnableCreatorModeResponse>(res);
    } catch (err) {
      next(err);
    }
  }

  async getTokensOwned(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<HttpResponse<GetTokensOwnedResponse>> {
    const count = req.pagination.count;
    const page = req.pagination.page;

    try {
      const { id } = req.params;

      const response = await this.getTokensOwnedUseCase.exec({
        user: id,
        count,
        page
      });

      const { tokens, total } = response.data;

      return new HttpResponse<GetTokensOwnedResponse>(
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
