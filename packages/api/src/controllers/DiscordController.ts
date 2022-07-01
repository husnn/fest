import {
  CommunityRepository,
  DiscordService,
  GetDiscordLink,
  GetDiscordLinkStatus,
  LinkDiscord,
  OAuthRepository,
  TokenOwnershipRepository,
  UnlinkDiscord,
  WalletRepository
} from '@fest/core';
import {
  GetDiscordLinkResponse,
  GetDiscordLinkStatusResponse,
  LinkDiscordResponse,
  UnlinkDiscordResponse,
  getTokenUrl
} from '@fest/shared';
import { HttpError, HttpResponse, ValidationError } from '../http';
import { NextFunction, Request, Response } from 'express';

import { appConfig } from '../config';

class DiscordController {
  private getLinkUseCase: GetDiscordLink;
  private linkUseCase: LinkDiscord;
  private unlinkUseCase: UnlinkDiscord;
  private getLinkStatusUseCase: GetDiscordLinkStatus;

  constructor(
    oAuthRepository: OAuthRepository,
    walletRepository: WalletRepository,
    ownershipRepository: TokenOwnershipRepository,
    communityRepository: CommunityRepository,
    discordService: DiscordService
  ) {
    this.getLinkUseCase = new GetDiscordLink(
      communityRepository,
      discordService
    );
    this.linkUseCase = new LinkDiscord(
      oAuthRepository,
      walletRepository,
      ownershipRepository,
      communityRepository,
      discordService
    );
    this.unlinkUseCase = new UnlinkDiscord(
      oAuthRepository,
      walletRepository,
      ownershipRepository,
      communityRepository,
      discordService
    );
    this.getLinkStatusUseCase = new GetDiscordLinkStatus(
      oAuthRepository,
      discordService
    );
  }

  async link(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, guild, state } = req.body;

      if (!code) throw new ValidationError('Missing code.');

      const result = await this.linkUseCase.exec({
        user: req.user,
        code,
        guild,
        state
      });
      if (!result.success)
        throw new HttpError('Could not link Discord account.');

      return new HttpResponse<LinkDiscordResponse>(res, {
        redirect:
          appConfig.clientUrl +
          (result.data?.token ? getTokenUrl(null, result.data.token) : '/')
      });
    } catch (err) {
      next(err);
    }
  }

  async getAuthLink(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.getLinkUseCase.exec({
        user: req.user,
        community: req.query.community as string
      });
      if (!result.success)
        throw new HttpError('Could not get Discord auth link.');

      return new HttpResponse<GetDiscordLinkResponse>(res, {
        body: result.data
      });
    } catch (err) {
      next(err);
    }
  }

  async unlink(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.unlinkUseCase.exec({ user: req.user });
      if (!result.success)
        throw new HttpError('Could not unlink Discord account.');

      return new HttpResponse<UnlinkDiscordResponse>(res);
    } catch (err) {
      next(err);
    }
  }

  async getLinkStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.getLinkStatusUseCase.exec({ user: req.user });
      if (!result.success)
        throw new HttpError('Could not get Discord auth status.');

      return new HttpResponse<GetDiscordLinkStatusResponse>(res, {
        body: result.data
      });
    } catch (err) {
      next(err);
    }
  }
}

export default DiscordController;
