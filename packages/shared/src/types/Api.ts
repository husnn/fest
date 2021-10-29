/* eslint-disable @typescript-eslint/no-empty-interface */

import {
  CurrentUserDTO,
  InviteDTO,
  TokenDTO,
  TokenListingDTO,
  TokenOfferDTO,
  TokenOwnedDTO,
  TokenOwnershipDTO,
  TokenTradeDTO,
  UserDTO
} from '../dto';
import { Protocol, WaitlistEntryType } from '../enums';

import { ProtocolConfig } from './';
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
  params: {
    count: number;
    page: number;
  };
}

/**
 * Init
 */

export type InitConfig = {
  expires: Date;
  protocols?: {
    [key in Protocol]?: ProtocolConfig;
  };
};

export interface InitResponse extends Response<InitConfig> {}

/**
 * Insider
 */

export interface RequestTestFundsResponse extends Response {
  txHash: string;
}

export interface RequestTestFundsRequest extends Request {
  method: 'POST';
  endpoint: '/insider/test-funds';
  authentication: 'required';
  body: {
    protocol: Protocol;
    currencyContract: string;
  };
}

/**
 * Token Market
 */

export interface WithdrawMarketEarningsResponse extends Response {
  txHash: string;
}

export interface WithdrawMarketEarningsRequest extends Request {
  method: 'POST';
  endpoint: '/market/withdraw';
  authentication: 'required';
  body: {
    protocol: Protocol;
    currency: string;
    amount: string;
  };
}

export interface GetTokenTradesForUserResponse
  extends PaginatedResponse<TokenTradeDTO> {}

export interface GetTokenTradesForUserRequest extends PaginatedRequest {
  method: 'GET';
  endpoint: '/market/trades';
  authentication: 'required';
}

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
    price: {
      currency: string;
      amount: string;
    };
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
    price: {
      currency: string;
      amount: string;
    };
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
  royaltyPct: number;
}

export interface CreateTokenResponse extends Response {
  body: {
    token: string;
  };
}

export interface CreateTokenRequest extends Request {
  body: TokenData;
}

export interface GetSignedTokenImageUploadUrlResponse extends Response {
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
    filesize: number;
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
  authentication: 'required';
  body: UserInfo;
}

/**
 * Referral
 */

export interface GetReferralSummaryResponse extends Response {
  invites: InviteDTO[];
}

export interface GetReferralSummaryRequest extends Request {
  method: 'GET';
  endpoint: '/referral';
  authentication: 'required';
}

/**
 * Creator mode
 */

export interface EnableCreatorModeResponse extends Response {}

export interface EnableCreatorModeRequest extends Request {
  method: 'POST';
  endpoint: '/users/enable-creator';
  authentication: 'required';
  body: { code: string };
}

/**
 * Waitlist
 */

export interface JoinWaitlistResponse extends Response {}
export interface JoinWaitlistRequest extends Request {
  method: 'POST';
  endpoint: '/waitlist';
  authentication: 'none';
  body: {
    type: WaitlistEntryType;
    emailAddress: string;
    useWallet: boolean;
    walletAddress?: string;
    socialMedia?: string;
  };
}

/**
 * Login
 */

export interface AuthPrecheckResponse extends Response {
  exists: boolean;
  needsInvite?: boolean;
}

export interface AuthPrecheckRequest extends Request {
  method: 'POST';
  endpoint: '/precheck';
  authentication: 'none';
  body: {
    identifier: string;
  };
}

export interface LoginResponse extends Response {
  token: string;
  user: CurrentUserDTO;
}

export interface LoginWithEmailRequest extends Request {
  body: {
    email: string;
    password: string;
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
    password: string;
    invite?: string;
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
    invite?: string;
  };
}
