import {
  GetGoogleAuthLink,
  GetGoogleAuthStatus,
  GoogleService,
  LinkGoogle,
  OAuthRepository,
  UnlinkGoogle,
  User
} from '@fest/core';
import {
  GetOAuthLinkResponse,
  OAuthCheckLinkResponse,
  UnlinkOAuthResponse
} from '@fest/shared';
import { HttpError, HttpResponse } from '../http';
import { NextFunction, Request, Response } from 'express';

import { appConfig } from '../config';

class GoogleController {
  private getGoogleAuthLinkUseCase: GetGoogleAuthLink;
  private linkGoogleUseCase: LinkGoogle;
  private getGoogleAuthStatusUseCase: GetGoogleAuthStatus;
  private unlinkGoogleUseCase: UnlinkGoogle;

  constructor(oAuthRepository: OAuthRepository, googleService: GoogleService) {
    this.getGoogleAuthLinkUseCase = new GetGoogleAuthLink(googleService);
    this.linkGoogleUseCase = new LinkGoogle(oAuthRepository, googleService);
    this.getGoogleAuthStatusUseCase = new GetGoogleAuthStatus(
      oAuthRepository,
      googleService
    );
    this.unlinkGoogleUseCase = new UnlinkGoogle(oAuthRepository);
  }

  async unlink(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.unlinkGoogleUseCase.exec({ user: req.user });
      if (!result.success) throw new HttpError();

      return new HttpResponse<UnlinkOAuthResponse>(res);
    } catch (err) {
      next(err);
    }
  }

  async checkLink(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.getGoogleAuthStatusUseCase.exec({
        user: req.user
      });

      return new HttpResponse<OAuthCheckLinkResponse>(res, {
        linked: result.success && result.data?.linked
      });
    } catch (err) {
      next(err);
    }
  }

  async link(req: Request, res: Response, next: NextFunction) {
    try {
      let user = req.user;
      let { code } = req.body;

      if (!code) {
        code = req.query.code;
        const state = req.query.state;
        user = state ? User.fromJwt(state.toString()).userId : null;
      }

      if (!user || !code) throw new HttpError('Invalid user or code.');

      const result = await this.linkGoogleUseCase.exec({
        user,
        code: code.toString()
      });

      if (!result.success) throw new HttpError();

      res.redirect(appConfig.clientUrl);
    } catch (err) {
      next(err);
    }
  }

  async getAuthLink(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.getGoogleAuthLinkUseCase.exec({
        state: User.generateJwt(new User({ id: req.user }))
      });

      return new HttpResponse<GetOAuthLinkResponse>(res, {
        body: {
          link: result.data
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

export default GoogleController;
