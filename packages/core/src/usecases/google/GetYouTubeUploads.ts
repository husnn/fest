import { GoogleService, YouTubeService } from '../../services';
import { OAuthProvider, YouTubeVideo } from '@fest/shared';

import OAuthRepository from '../../repositories/OAuthRepository';
import { Result } from '@fest/shared';
import UseCase from '../../base/UseCase';

export interface GetYouTubeUploadsInput {
  user: string;
  count?: number;
  playlist?: string;
  page?: string;
}

export type GetYouTubeUploadsOutput = {
  videos: YouTubeVideo[];
  count: number;
  playlist: string;
  nextPage: string;
};

export class GetYouTubeUploads extends UseCase<
  GetYouTubeUploadsInput,
  GetYouTubeUploadsOutput
> {
  private oAuthRepository: OAuthRepository;
  private googleService: GoogleService;
  private youTubeService: YouTubeService;

  constructor(
    oAuthRepository: OAuthRepository,
    googleService: GoogleService,
    youTubeService: YouTubeService
  ) {
    super();

    this.oAuthRepository = oAuthRepository;
    this.googleService = googleService;
    this.youTubeService = youTubeService;
  }

  async exec(
    data: GetYouTubeUploadsInput
  ): Promise<Result<GetYouTubeUploadsOutput>> {
    const oAuth = await this.oAuthRepository.findByUser(
      OAuthProvider.GOOGLE,
      data.user
    );

    if (!oAuth) return Result.fail();

    if (oAuth.expiry < new Date()) {
      const refreshed = await this.googleService.refreshTokenData(
        oAuth.refreshToken
      );

      if (!refreshed.success) return Result.fail();

      const { accessToken, refreshToken, expiry } = refreshed.data;

      oAuth.accessToken = accessToken;
      oAuth.refreshToken = refreshToken;
      oAuth.expiry = expiry;

      this.oAuthRepository.createOrUpdate(oAuth);
    }

    const result = await this.youTubeService.getOwnUploads(
      oAuth.accessToken,
      data.count,
      data.playlist,
      data.page
    );

    return result.success ? Result.ok(result.data) : Result.fail();
  }
}
