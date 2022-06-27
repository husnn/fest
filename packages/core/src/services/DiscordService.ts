import { Result } from '../Result';

export interface DiscordTokenData {
  accessToken: string;
  refreshToken: string;
  expiry: Date;
}

export interface DiscordService {
  getOAuthLink(): string;
  getTokenData(code: string): Promise<Result<DiscordTokenData>>;
  refreshTokenData(refreshToken: string): Promise<Result<DiscordTokenData>>;
  revokeToken(token: string): Promise<Result>;
}

export default DiscordService;
