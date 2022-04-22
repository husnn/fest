import {
  GoogleService as IGoogleService,
  GoogleTokenData,
  Result
} from '@fest/core';
import { getExpiryDate } from '@fest/shared';
import Axios from 'axios';
import qs from 'querystring';

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
}

class GoogleService implements IGoogleService {
  private config: GoogleConfig;

  constructor(config: GoogleConfig) {
    this.config = config;
  }

  extractTokenData(raw: any): Result<GoogleTokenData> {
    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn
    } = raw;

    const data: GoogleTokenData = {
      accessToken,
      refreshToken,
      expiry: getExpiryDate(expiresIn)
    };

    return Result.ok(data);
  }

  getOAuthLink(state?: string): Result<string> {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?${qs.stringify({
      scope: 'https://www.googleapis.com/auth/youtube.readonly',
      access_type: 'offline',
      response_type: 'code',
      state: state,
      redirect_uri: this.config.redirectUrl,
      client_id: this.config.clientId
    })}`;

    return Result.ok(url);
  }

  async getTokenData(code: string): Promise<Result<GoogleTokenData>> {
    const response = await Axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: this.config.redirectUrl
    });

    const tokenData = this.extractTokenData(response.data);

    return tokenData.success ? Result.ok(tokenData.data) : Result.fail();
  }

  async refreshTokenData(
    refreshToken: string
  ): Promise<Result<GoogleTokenData>> {
    const response = await Axios.post('https://oauth2.googleapis.com/token', {
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    const tokenData = this.extractTokenData(response.data);
    if (!tokenData.success) Result.fail();

    tokenData.data.refreshToken = refreshToken;

    return tokenData;
  }
}

export default GoogleService;
