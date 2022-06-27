import {
  DiscordService,
  GetDiscordLinkStatus,
  LinkDiscord,
  OAuthRepository,
  UnlinkDiscord
} from '@fest/core';
import {
  GetDiscordLinkResponse,
  GetDiscordLinkStatusResponse,
  LinkDiscordResponse,
  UnlinkDiscordResponse
} from '@fest/shared';
import { HttpError, HttpResponse, ValidationError } from '../http';
import { NextFunction, Request, Response } from 'express';

class DiscordController {
  private discordService: DiscordService;

  private linkUseCase: LinkDiscord;
  private unlinkUseCase: UnlinkDiscord;
  private getLinkStatusUseCase: GetDiscordLinkStatus;

  constructor(
    oAuthRepository: OAuthRepository,
    discordService: DiscordService
  ) {
    this.discordService = discordService;

    this.linkUseCase = new LinkDiscord(oAuthRepository, discordService);
    this.unlinkUseCase = new UnlinkDiscord(oAuthRepository, discordService);
    this.getLinkStatusUseCase = new GetDiscordLinkStatus(
      oAuthRepository,
      discordService
    );
  }

  async link(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.body;

      if (!code) throw new ValidationError('Missing code.');

      const result = await this.linkUseCase.exec({
        user: req.user,
        code
      });
      if (!result.success)
        throw new HttpError('Could not link Discord account.');

      return new HttpResponse<LinkDiscordResponse>(res);
    } catch (err) {
      next(err);
    }
  }

  async getAuthLink(req: Request, res: Response, next: NextFunction) {
    try {
      return new HttpResponse<GetDiscordLinkResponse>(res, {
        body: this.discordService.getOAuthLink()
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
