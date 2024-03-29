import { OAuthProvider, Result } from '@fest/shared';

import GoogleService from '../../services/GoogleService';
import OAuthRepository from '../../repositories/OAuthRepository';
import UseCase from '../../base/UseCase';
import refreshIfExpired from '../refreshIfExpired';

export type GetGoogleAuthStatusInput = {
  user: string;
};

export type GetGoogleAuthStatusOutput = {
  linked: boolean;
};

export class GetGoogleAuthStatus extends UseCase<
  GetGoogleAuthStatusInput,
  GetGoogleAuthStatusOutput
> {
  private oAuthRepository: OAuthRepository;
  private googleService: GoogleService;

  constructor(oAuthRepository: OAuthRepository, googleService: GoogleService) {
    super();

    this.oAuthRepository = oAuthRepository;
    this.googleService = googleService;
  }

  async exec(
    data: GetGoogleAuthStatusInput
  ): Promise<Result<GetGoogleAuthStatusOutput>> {
    let linked = false;

    let oAuth = await this.oAuthRepository.findByUser(
      OAuthProvider.GOOGLE,
      data.user
    );

    if (oAuth && oAuth.accessToken) {
      const refreshedAuth = await refreshIfExpired(oAuth, this.googleService);
      oAuth = refreshedAuth.success ? refreshedAuth.data.oAuth : null;

      if (!oAuth) return Result.fail();

      if (refreshedAuth.data.refreshed) {
        this.oAuthRepository.createOrUpdate(oAuth);
      }

      linked = true;
    }

    return Result.ok({ linked });
  }
}
