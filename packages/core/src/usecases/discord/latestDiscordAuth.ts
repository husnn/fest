import { DiscordService } from '../../services';
import { OAuth } from '@fest/core';
import { Result } from '../../Result';

export const latestDiscordAuth = async (
  oAuth: OAuth,
  discordService: DiscordService
): Promise<Result<{ refreshed: boolean; oAuth: OAuth }>> => {
  let isRefreshed = false;

  if (oAuth.expiry < new Date()) {
    const refreshed = await discordService.refreshTokenData(oAuth.refreshToken);
    if (!refreshed.success) return Result.fail();
    oAuth = {
      ...oAuth,
      ...refreshed.data
    };

    isRefreshed = true;
  }

  return Result.ok({ refreshed: isRefreshed, oAuth });
};

export default latestDiscordAuth;
