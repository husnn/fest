import { Result } from '../Result';

export interface DiscordTokenData {
  accessToken: string;
  refreshToken: string;
  expiry: Date;
}

export interface DiscordService {
  getOAuthLink(linkGuild?: boolean, state?: string): string;
  getTokenData(code: string): Promise<Result<DiscordTokenData>>;
  refreshTokenData(refreshToken: string): Promise<Result<DiscordTokenData>>;
  revokeToken(token: string): Promise<Result>;
  getGuildName(id: string): Promise<Result<string>>;
}

export default DiscordService;
