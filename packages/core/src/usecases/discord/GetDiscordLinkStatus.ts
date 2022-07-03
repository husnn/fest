import { OAuthProvider, Result } from '@fest/shared';

import { DiscordService } from 'core/src/services';
import OAuthRepository from '../../repositories/OAuthRepository';
import UseCase from '../../base/UseCase';
import latestDiscordAuth from './latestDiscordAuth';

export type GetDiscordLinkStatusInput = {
  user: string;
};

export type GetDiscordLinkStatusOutput = boolean;

export class GetDiscordLinkStatus extends UseCase<
  GetDiscordLinkStatusInput,
  GetDiscordLinkStatusOutput
> {
  private oAuthRepository: OAuthRepository;
  private discordService: DiscordService;

  constructor(
    oAuthRepository: OAuthRepository,
    discordService: DiscordService
  ) {
    super();

    this.oAuthRepository = oAuthRepository;
    this.discordService = discordService;
  }

  async exec(
    data: GetDiscordLinkStatusInput
  ): Promise<Result<GetDiscordLinkStatusOutput>> {
    let linked = false;

    let oAuth = await this.oAuthRepository.findByUser(
      OAuthProvider.DISCORD,
      data.user
    );

    if (oAuth && oAuth.accessToken) {
      const refreshedAuth = await latestDiscordAuth(oAuth, this.discordService);
      oAuth = refreshedAuth.success ? refreshedAuth.data.oAuth : null;

      if (!oAuth) return Result.fail();

      if (refreshedAuth.data.refreshed) {
        this.oAuthRepository.createOrUpdate(oAuth);
      }

      linked = true;
    }

    return Result.ok(linked);
  }
}
