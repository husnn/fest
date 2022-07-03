import { Result } from '@fest/shared';

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
  getCurrentUserID(accessToken: string): Promise<Result<string>>;
  getGuildName(id: string): Promise<Result<string>>;
  addMember(
    guildId: string,
    memberId: string,
    memberAccessToken: string
  ): Promise<Result<boolean>>;
  kickMember(guildId: string, memberId: string): Promise<Result<boolean>>;
}

export default DiscordService;
