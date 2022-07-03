import * as qs from 'querystring';

import { DiscordConfig, defaultConfig } from './config';
import {
  DiscordTokenData,
  DiscordService as IDiscordService
} from '@fest/core';
import { Result, getExpiryDate } from '@fest/shared';
import axios, { Axios, AxiosError } from 'axios';

export class DiscordService implements IDiscordService {
  private baseUrl: string;
  private client: Axios;
  private config: DiscordConfig;

  constructor(config = defaultConfig) {
    this.baseUrl = `https://discord.com/api`;
    this.client = axios.create({ baseURL: this.baseUrl });
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

  getOAuthLink(linkGuild = false, state?: string): string {
    const params: any = {
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUrl,
      response_type: 'code',
      scope: 'guilds guilds.join identify'
    };

    if (linkGuild) {
      params.permissions = 8;
      params.scope = `${params.scope} bot`;
      params.state = state;
    }

    return `https://discord.com/api/oauth2/authorize?${qs.stringify(params)}`;
  }

  async getTokenData(code: string): Promise<Result<DiscordTokenData>> {
    try {
      const params = new URLSearchParams();

      params.append('client_id', this.config.clientId);
      params.append('client_secret', this.config.clientSecret);
      params.append('grant_type', 'authorization_code');
      params.append('redirect_uri', this.config.redirectUrl);
      params.append('code', code);

      const response = await axios.post(
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

      const response = await axios.post(
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

      await axios.post('https://discord.com/api/oauth2/token/revoke', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      return Result.ok();
    } catch (err) {
      return Result.fail();
    }
  }

  async getCurrentUserID(accessToken: string): Promise<Result<string>> {
    try {
      const res = await this.client.get(`/users/@me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return Result.ok(res.data['id']);
    } catch {
      return Result.fail();
    }
  }

  async getGuildName(id: string): Promise<Result<string>> {
    try {
      const res = await this.client.get(`/guilds/${id}`, {
        headers: {
          Authorization: `Bot ${this.config.botToken}`,
          'Content-Type': 'application/json'
        }
      });
      return Result.ok(res.data['name']);
    } catch (err) {
      return Result.fail();
    }
  }

  async addMember(
    guildId: string,
    memberId: string,
    memberAccessToken: string
  ): Promise<Result<boolean>> {
    try {
      await this.client.put(
        `/guilds/${guildId}/members/${memberId}`,
        {
          access_token: memberAccessToken
        },
        {
          headers: {
            Authorization: `Bot ${this.config.botToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return Result.ok(true);
    } catch (err) {
      return Result.fail();
    }
  }

  async kickMember(
    guildId: string,
    memberId: string
  ): Promise<Result<boolean>> {
    try {
      await this.client.delete(`/guilds/${guildId}/members/${memberId}`, {
        headers: {
          Authorization: `Bot ${this.config.botToken}`,
          'Content-Type': 'application/json'
        }
      });
      return Result.ok(true);
    } catch (err) {
      if ((err as AxiosError).response.status == 404) return Result.ok(false);
      return Result.fail();
    }
  }
}

export default DiscordService;
