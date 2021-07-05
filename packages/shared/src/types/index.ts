import { CurrentUserDTO, TokenDTO, TokenOwnedDTO, TokenOwnershipDTO, UserDTO } from '../dto';
import { Protocol } from '../enums';
import TokenFee from './TokenFee';
import TokenMetadata from './TokenMetadata';

export type HttpMethod = 'GET' | 'POST' | 'PUT';

export type AuthLevel = 'none' | 'required' | 'optional';

export interface Request {
  method: HttpMethod;
  endpoint: string;
  authentication?: AuthLevel;
  body?: any;
  params?: any;
  headers?: any;
}

export interface Response<T = any> {
  success: boolean;
  status: number;
  body?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> extends Response {
  body: T[];
  page: number;
  count: number;
  nextPage?: number;
  hasMore?: boolean;
}

/**
 * Token
 */

export interface ApproveMintResponse extends Response {
  data: string;
  expiry: number;
  salt: string;
  signature: string;
}

export interface ApproveMintRequest extends Request {
  authenticated: 'required';
  body: {
    protocol: Protocol;
    token: string;
  };
}

export interface GetTokenOwnershipsResponse
  extends PaginatedResponse<TokenOwnershipDTO> {}

export interface GetTokenOwnershipResponse
  extends Response<TokenOwnershipDTO> {}

export interface GetTokensCreatedResponse extends PaginatedResponse<TokenDTO> {}

export interface GetTokenResponse extends Response {
  token: TokenDTO;
}

export interface GetTokenRequest extends Request {}

export interface TokenData extends TokenMetadata {
  resource?: string;
  supply: number;
  fees?: TokenFee[];
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

export interface GetTokensOwnedResponse
  extends PaginatedResponse<TokenOwnedDTO> {}

export interface GetUserResponse extends Response {
  user: UserDTO;
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
  bio?: string;
};

export interface EditUserResponse extends Response {
  user: CurrentUserDTO;
}

export interface EditUserRequest extends Request {
  authenticated: 'required';
  body: UserInfo;
}

/**
 * Login
 */

export interface LoginResponse extends Response {
  token: string;
  user: CurrentUserDTO;
}

export interface LoginWithEmailRequest extends Request {
  body: {
    email: string;
    code: string;
  };
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

export * from './TokenFee';
export * from './TokenAttributes';
export * from './TokenMetadata';
