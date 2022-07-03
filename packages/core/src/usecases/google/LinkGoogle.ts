import { OAuthProvider, Result } from '@fest/shared';

import { GoogleService } from '../../services';
import { OAuth } from '../../entities';
import OAuthRepository from '../../repositories/OAuthRepository';
import UseCase from '../../base/UseCase';

export interface LinkGoogleInput {
  user: string;
  code: string;
}
export type LinkGoogleOutput = any;

export class LinkGoogle extends UseCase<LinkGoogleInput, LinkGoogleOutput> {
  private oAuthRepository: OAuthRepository;
  private googleService: GoogleService;

  constructor(oAuthRepository: OAuthRepository, googleService: GoogleService) {
    super();

    this.oAuthRepository = oAuthRepository;
    this.googleService = googleService;
  }

  async exec(data: LinkGoogleInput): Promise<Result<LinkGoogleOutput>> {
    let auth = await this.oAuthRepository.findByUser(
      OAuthProvider.GOOGLE,
      data.user
    );

    const tokens = await this.googleService.getTokenData(data.code);

    const { accessToken, refreshToken, expiry } = tokens.data;

    if (!auth) {
      auth = new OAuth({
        provider: OAuthProvider.GOOGLE,
        userId: data.user
      });
    }

    auth.accessToken = accessToken;
    auth.refreshToken = refreshToken;
    auth.expiry = expiry;

    await this.oAuthRepository.createOrUpdate(auth);

    return Result.ok<LinkGoogleOutput>();
  }
}
