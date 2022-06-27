import {
  DiscordTokenData,
  DiscordService as IDiscordService,
  Result
} from '@fest/core';

import Axios from 'axios';
import { getExpiryDate } from '@fest/shared';
import qs from 'querystring';

export interface DiscordConfig {
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
}

class DiscordService implements IDiscordService {
  private config: DiscordConfig;

  constructor(config: DiscordConfig) {
    this.config = config;
  }

  extractTokenData(raw: any): DiscordTokenData {
    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn
    } = raw;

    return {
      accessToken,
      refreshToken,
      expiry: getExpiryDate(expiresIn)
    } as DiscordTokenData;
  }

  getOAuthLink(): string {
    return `https://discord.com/api/oauth2/authorize?${qs.stringify({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUrl,
      response_type: 'code',
      scope: 'guilds.join'
    })}`;
  }

  async getTokenData(code: string): Promise<Result<DiscordTokenData>> {
    try {
      const params = new URLSearchParams();

      params.append('client_id', this.config.clientId);
      params.append('client_secret', this.config.clientSecret);
      params.append('grant_type', 'authorization_code');
      params.append('redirect_uri', this.config.redirectUrl);
      params.append('code', code);

      const response = await Axios.post(
        'https://discord.com/api/oauth2/token',
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      return Result.ok(this.extractTokenData(response.data));
    } catch (err) {
      return Result.fail();
    }
  }

  async refreshTokenData(
    refreshToken: string
  ): Promise<Result<DiscordTokenData>> {
    try {
      const params = new URLSearchParams();

      params.append('client_id', this.config.clientId);
      params.append('client_secret', this.config.clientSecret);
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', refreshToken);

      const response = await Axios.post(
        'https://discord.com/api/oauth2/token',
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      return Result.ok(this.extractTokenData(response.data));
    } catch (err) {
      console.log(err.response.data);
      return Result.fail();
    }
  }

  async revokeToken(token: string): Promise<Result> {
    try {
      const params = new URLSearchParams();

      params.append('client_id', this.config.clientId);
      params.append('client_secret', this.config.clientSecret);
      params.append('token', token);

      await Axios.post('https://discord.com/api/oauth2/token/revoke', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      return Result.ok();
    } catch (err) {
      return Result.fail();
    }
  }
}

export default DiscordService;
