import { Result } from '@fest/shared';

export interface GoogleTokenData {
  accessToken: string;
  refreshToken: string;
  expiry: Date;
}

export interface GoogleService {
  getOAuthLink(state?: string): Result<string>;
  getTokenData(code: string): Promise<Result<GoogleTokenData>>;
  refreshTokenData(refreshToken: string): Promise<Result<GoogleTokenData>>;
}

export default GoogleService;
