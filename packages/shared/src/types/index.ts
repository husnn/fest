import { CurrentUser, Token, User } from '../dto';
import { Protocol } from '../enums';

export type HttpMethod = 'GET' | 'POST' | 'PUT';

export type AuthLevel = 'none' | 'required' | 'optional';

export interface Request {
  method: HttpMethod;
  endpoint: string;
  authentication?: AuthLevel;
  body?: object;
  params?: object;
  headers?: object;
}

export interface Response {
  success: boolean;
  status: number;
  body?: any;
  error?: string;
  message?: string;
}

/**
 * Token
 */

export interface ApproveMintResponse extends Response {
  data: string;
  signature: string;
  salt: string;
}

export interface ApproveMintRequest extends Request {
  authenticated: 'required';
  body: {
    protocol: Protocol;
    supply: number;
  };
}

export interface GetTokensCreatedResponse extends Response {
  body: {
    tokens: Token[];
  };
}

export interface GetTokenResponse extends Response {
  token: Token;
}

export interface GetTokenRequest extends Request {}

export interface TokenData {
  name: string;
  description?: string;
  supply: number;
}

export interface CreateTokenResponse extends Response {
  body: {
    token: string;
  };
}

export interface CreateTokenRequest extends Request {
  body: TokenData;
}

/**
 * YouTube
 */

export interface YouTubeVideo {
  id: string;
  datePublished: string;
  thumbnail: string;
  title: string;
  description: string;
}

export interface GetOwnUploadsResponse extends Response {
  videos: YouTubeVideo[];
  count: number;
  playlist: string;
  nextPage: string;
}

export interface GetOwnUploadsRequest extends Request {
  authentication: 'required';
  params: {
    count?: number;
    playlist?: string;
    page?: string;
  };
}

/**
 * OAuth
 */

export interface UnlinkOAuthResponse extends Response {}

export interface UnlinkOAuthRequest extends Request {
  authentication: 'required';
}

export interface OAuthCheckLinkResponse extends Response {
  linked: boolean;
}

export interface OAuthCheckLinkRequest extends Request {
  authentication: 'required';
}

export interface OAuthLinkRequest extends Request {
  authentication: 'required';
  body: {
    code: string;
  };
}

export interface GetOAuthLinkResponse extends Response {
  body: {
    link: string;
  };
}

export interface GetOAuthLinkRequest extends Request {
  authentication: 'required';
}

/**
 * User
 */

export interface GetUserResponse extends Response {
  user: User;
}

export interface GetUserByIdRequest extends Request {
  method: 'GET';
  authentication: 'none';
}

export interface GetUserByUsernameRequest extends Request {
  method: 'GET';
  authentication: 'none';
  params: {
    username: string;
  };
}

export type UserInfo = {
  name?: string;
  username?: string;
  email?: string;
};

export interface EditUserResponse extends Response {
  user: CurrentUser;
}

export interface EditUserRequest extends Request {
  authenticated: 'required';
  body: UserInfo;
}

/**
 * Login
 */

export interface LoginWithEmailResponse extends Response {
  token: string;
  user: CurrentUser;
}

export interface LoginWithEmailRequest extends Request {
  body: {
    email: string;
    code: string;
  };
}

export interface LoginWithWalletResponse extends Response {
  token: string;
  user: CurrentUser;
}

export interface LoginWithWalletRequest extends Request {
  body: {
    protocol: Protocol;
    code: string;
    signature: string;
  };
}

/**
 * Identify user
 */

export interface IdentifyWithEmailResponse extends Response {}

export interface IdentifyWithEmailRequest extends Request {
  body: {
    email: string;
  };
}

export interface IdentifyWithWalletResponse extends Response {
  body: {
    code: string;
    message: string;
  };
}

export interface IdentifyWithWalletRequest extends Request {
  body: {
    protocol: Protocol;
    address: string;
  };
}
