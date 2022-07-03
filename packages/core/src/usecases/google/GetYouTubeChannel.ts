import { GoogleService, YouTubeService } from '../../services';

import { OAuthProvider } from '@fest/shared';
import OAuthRepository from '../../repositories/OAuthRepository';
import { Result } from '@fest/shared';
import UseCase from '../../base/UseCase';
import { YouTubeChannel } from '../../entities';
import refreshIfExpired from '../refreshIfExpired';

export type GetYouTubeChannelInput = {
  user: string;
};

export type GetYouTubeChannelOutput = YouTubeChannel;

export class GetYouTubeChannel extends UseCase<
  GetYouTubeChannelInput,
  GetYouTubeChannelOutput
> {
  private oAuthRepository: OAuthRepository;
  private googleService: GoogleService;
  private youtubeService: YouTubeService;

  constructor(
    oAuthRepository: OAuthRepository,
    googleService: GoogleService,
    youtubeService: YouTubeService
  ) {
    super();

    this.oAuthRepository = oAuthRepository;
    this.googleService = googleService;
    this.youtubeService = youtubeService;
  }

  async exec(
    data: GetYouTubeChannelInput
  ): Promise<Result<GetYouTubeChannelOutput>> {
    let oAuth = await this.oAuthRepository.findByUser(
      OAuthProvider.GOOGLE,
      data.user
    );

    if (!oAuth) return Result.fail();

    if (oAuth) {
      const refreshedAuth = await refreshIfExpired(oAuth, this.googleService);
      oAuth = refreshedAuth.success ? refreshedAuth.data.oAuth : null;

      if (!oAuth) return Result.fail();

      if (refreshedAuth.data.refreshed) {
        this.oAuthRepository.createOrUpdate(oAuth);
      }
    }

    const response = await this.youtubeService.getOwnChannel(oAuth.accessToken);

    return response.success ? Result.ok(response.data) : Result.fail();
  }
}
