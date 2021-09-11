import {
    CurrentUserDTO, TokenDTO, TokenListingDTO, TokenOfferDTO, TokenOwnedDTO, TokenOwnershipDTO,
    TokenTradeDTO, UserDTO
} from '../dto';
import { Protocol } from '../enums';
import { Price } from './Price';
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

export interface PaginatedRequest extends Request {
  params?: {
    count?: number;
    page?: number;
  };
}

/**
 * Token Market
 */

export interface CancelTokenListingResponse extends Response {
  txHash: string;
}

export interface CancelTokenListingRequest extends Request {
  method: 'POST';
  authentication: 'required';
}

export interface BuyTokenListingResponse extends Response {
  txHash: string;
}

export interface BuyTokenListingRequest extends Request {
  method: 'POST';
  authentication: 'required';
  body: {
    quantity: number;
  };
}

export interface GetListingsForTokenResponse
  extends PaginatedResponse<TokenListingDTO> {}

export interface GetListingsForTokenRequest extends PaginatedRequest {
  method: 'GET';
}

export interface GetTokenMarketSummaryResponse extends Response {
  offers: TokenOfferDTO[];
  listings: TokenListingDTO[];
  trades: TokenTradeDTO[];
}

export interface GetTokenMarketSummaryRequest extends Request {
  method: 'GET';
  authentication: 'required';
}

export interface ListTokenForSaleResponse extends Response {
  txHash: string;
}

export interface ListTokenForSaleRequest extends Request {
  authentication: 'required';
  body: {
    quantity: number;
    price: Price;
  };
}

export interface ApproveTokenSaleResponse extends Response {
  expiry: number;
  salt: string;
  signature: string;
}

export interface ApproveTokenSaleRequest extends Request {
  authentication: 'required';
  body: {
    quantity: number;
    price: Price;
  };
}

/**
 * Token
 */

export interface MintTokenResponse extends Response {
  txHash: string;
}
export interface MintTokenRequest extends Request {
  authenticated: 'required';
  body: {
    protocol: Protocol;
  };
}

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

export interface GetTokenImageUploadUrlResponse extends Response {
  signedUrl: string;
  url: string;
}

export interface GetTokenImageUploadUrlRequest extends Request {
  method: 'GET';
  authentication: 'required';
  endpoint: '/tokens/image-upload-url';
  params: {
    filename: string;
    filetype: string;
  };
}

/**
 * YouTube
 */

export interface YouTubeVideo {
  id: string;
  datePublished: string;
  channelId: string;
  thumbnail: string;
  title: string;
  description: string;
  url: string;
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
