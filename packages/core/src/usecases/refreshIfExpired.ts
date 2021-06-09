import { OAuth } from '@fanbase/core';

import { Result } from '../Result';
import GoogleService from '../services/GoogleService';

export const refreshIfExpired = async (
  oAuth: OAuth,
  googleService: GoogleService
): Promise<Result<{ refreshed: boolean; oAuth: OAuth }>> => {
  let isRefreshed = false;

  if (oAuth.expiry < new Date()) {
    const refreshed = await googleService.refreshTokenData(oAuth.refreshToken);
    if (!refreshed.success) return Result.fail();

    const { accessToken, refreshToken, expiry } = refreshed.data;

    oAuth.accessToken = accessToken;
    oAuth.refreshToken = refreshToken;
    oAuth.expiry = expiry;

    isRefreshed = true;
  }

  return Result.ok({ refreshed: isRefreshed, oAuth });
};
export default refreshIfExpired;
