import {
  ApproveMintRequest,
  ApproveMintResponse,
  ApproveTokenSaleRequest,
  ApproveTokenSaleResponse,
  AuthPrecheckRequest,
  AuthPrecheckResponse,
  BuyTokenListingRequest,
  BuyTokenListingResponse,
  CancelTokenListingRequest,
  CancelTokenListingResponse,
  ChangeEmailAddressRequest,
  ChangeEmailAddressResponse,
  CreatePostDTO,
  CreatePostRequest,
  CreatePostResponse,
  CreateTokenRequest,
  CreateTokenResponse,
  DeletePostRequest,
  DeletePostResponse,
  EditUserRequest,
  EditUserResponse,
  EnableCreatorModeRequest,
  EnableCreatorModeResponse,
  GetCommunityRequest,
  GetCommunityResponse,
  GetCommunityTokenRequest,
  GetCommunityTokenResponse,
  GetFeedRequest,
  GetFeedResponse,
  GetListingsForTokenRequest,
  GetListingsForTokenResponse,
  GetOAuthLinkRequest,
  GetOAuthLinkResponse,
  GetOwnUploadsRequest,
  GetOwnUploadsResponse,
  GetPostMediaUploadURLsRequest,
  GetPostMediaUploadURLsResponse,
  GetReferralSummaryRequest,
  GetReferralSummaryResponse,
  GetSignedTokenImageUploadUrlResponse,
  GetTokenImageUploadUrlRequest,
  GetTokenMarketSummaryRequest,
  GetTokenMarketSummaryResponse,
  GetTokenOwnershipResponse,
  GetTokenOwnershipsResponse,
  GetTokenRequest,
  GetTokenResponse,
  GetTokensCreatedResponse,
  GetTokensOwnedResponse,
  GetTokenTradesForUserRequest,
  GetTokenTradesForUserResponse,
  GetUserByIdRequest,
  GetUserByUsernameRequest,
  GetUserCommunitiesResponse,
  GetUserResponse,
  IdentifyWithEmailRequest,
  IdentifyWithEmailResponse,
  IdentifyWithWalletRequest,
  IdentifyWithWalletResponse,
  InitResponse,
  isUsername,
  JoinWaitlistRequest,
  JoinWaitlistResponse,
  ListTokenForSaleRequest,
  ListTokenForSaleResponse,
  LoginResponse,
  LoginWithEmailRequest,
  LoginWithWalletRequest,
  MintTokenRequest,
  MintTokenResponse,
  OAuthCheckLinkRequest,
  OAuthCheckLinkResponse,
  OAuthLinkRequest,
  PostMediaUploadData,
  Protocol,
  RequestEmailAddressChangeRequest,
  RequestEmailAddressChangeResponse,
  RequestPasswordResetRequest,
  RequestPasswordResetResponse,
  RequestTestFundsRequest,
  RequestTestFundsResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SignOutRequest,
  SignOutResponse,
  TokenData,
  TokenDTO,
  TokenOwnershipDTO,
  UnlinkOAuthRequest,
  UnlinkOAuthResponse,
  UserInfo,
  WaitlistEntryType,
  WithdrawMarketEarningsRequest,
  WithdrawMarketEarningsResponse,
  YouTubeVideo
} from '@fest/shared';
import HttpClient from './HttpClient';

export class ApiClient {
  private client: HttpClient;

  static instance: ApiClient | undefined;

  static getInstance() {
    return this.instance;
  }

  constructor(client: HttpClient) {
    this.client = client;
    ApiClient.instance = this;
  }

  // Init

  async getInitConfig(): Promise<InitResponse> {
    return this.client.request<InitResponse>({
      method: 'GET',
      endpoint: '/init'
    });
  }

  // Feed

  async getFeed(cursor?: string): Promise<GetFeedResponse> {
    return this.client.request<GetFeedResponse, GetFeedRequest>({
      method: 'POST',
      authentication: 'required',
      endpoint: '/feed',
      body: { cursor }
    });
  }

  // Posts

  async deletePost(id: string): Promise<DeletePostResponse> {
    return this.client.request<DeletePostResponse, DeletePostRequest>({
      method: 'POST',
      authentication: 'required',
      endpoint: `/posts/${id}/delete`
    });
  }

  async getPostMediaUploadURLs(
    media: PostMediaUploadData[]
  ): Promise<GetPostMediaUploadURLsResponse> {
    return this.client.request<
      GetPostMediaUploadURLsResponse,
      GetPostMediaUploadURLsRequest
    >({
      method: 'POST',
      authentication: 'required',
      endpoint: '/posts/media-upload-urls',
      body: media
    });
  }

  async createPost(data: CreatePostDTO): Promise<CreatePostResponse> {
    return this.client.request<CreatePostResponse, CreatePostRequest>({
      method: 'POST',
      authentication: 'required',
      endpoint: '/posts',
      body: data
    });
  }

  // Community

  async getCommunityToken(id: string): Promise<GetCommunityTokenResponse> {
    return this.client.request<
      GetCommunityTokenResponse,
      GetCommunityTokenRequest
    >({
      method: 'GET',
      authentication: 'required',
      endpoint: `/communities/${id}/token`
    });
  }

  async getCommunity(id: string): Promise<GetCommunityResponse> {
    return this.client.request<GetCommunityResponse, GetCommunityRequest>({
      method: 'GET',
      endpoint: `/communities/${id}`
    });
  }

  // Internal

  async requestTestFunds(
    currency: string,
    protocol = Protocol.ETHEREUM
  ): Promise<RequestTestFundsResponse> {
    return this.client.request<
      RequestTestFundsResponse,
      RequestTestFundsRequest
    >({
      method: 'POST',
      endpoint: '/internal/test-funds',
      authentication: 'required',
      body: {
        protocol,
        currencyContract: currency
      }
    });
  }

  // Password reset

  async resetPassword(
    token: string,
    password: string
  ): Promise<ResetPasswordResponse> {
    return this.client.request<ResetPasswordResponse, ResetPasswordRequest>({
      method: 'POST',
      endpoint: '/auth/reset-password',
      authentication: 'optional',
      body: { token, password }
    });
  }

  async sendPasswordResetRequest(
    email: string
  ): Promise<RequestPasswordResetResponse> {
    return this.client.request<
      RequestPasswordResetResponse,
      RequestPasswordResetRequest
    >({
      method: 'POST',
      endpoint: '/auth/reset-password',
      authentication: 'optional',
      body: { email }
    });
  }

  // Token Market

  async withdrawMarketEarnings(
    currency: string,
    amount: string,
    protocol = Protocol.ETHEREUM
  ): Promise<string> {
    return this.client
      .request<WithdrawMarketEarningsResponse, WithdrawMarketEarningsRequest>({
        method: 'POST',
        endpoint: '/market/withdraw',
        authentication: 'required',
        body: {
          protocol,
          currency,
          amount
        }
      })
      .then((res) => {
        return res.txHash;
      });
  }

  async getTokenTradesForUser(
    count?: number,
    page?: number
  ): Promise<GetTokenTradesForUserResponse> {
    return this.client.request<
      GetTokenTradesForUserResponse,
      GetTokenTradesForUserRequest
    >({
      method: 'GET',
      endpoint: '/market/trades',
      authentication: 'required',
      params: {
        count,
        page
      }
    });
  }

  async cancelTokenListing(listingId: string): Promise<string> {
    const response = await this.client.request<
      CancelTokenListingResponse,
      CancelTokenListingRequest
    >({
      method: 'POST',
      endpoint: `/market/listings/${listingId}/cancel`,
      authentication: 'required'
    });

    return response.txHash;
  }

  async buyTokenListing(listingId: string, quantity: number): Promise<string> {
    const response = await this.client.request<
      BuyTokenListingResponse,
      BuyTokenListingRequest
    >({
      method: 'POST',
      endpoint: `/market/listings/${listingId}/buy`,
      authentication: 'required',
      body: {
        quantity
      }
    });

    return response.txHash;
  }

  async getListingsForToken(
    tokenId: string,
    count?: number,
    page?: number
  ): Promise<GetListingsForTokenResponse> {
    return this.client.request<
      GetListingsForTokenResponse,
      GetListingsForTokenRequest
    >({
      method: 'GET',
      endpoint: `/market/tokens/${tokenId}/listings`,
      params: {
        count,
        page
      }
    });
  }

  async getTokenMarketSummary(): Promise<GetTokenMarketSummaryResponse> {
    return this.client.request<
      GetTokenMarketSummaryResponse,
      GetTokenMarketSummaryRequest
    >({
      method: 'GET',
      endpoint: '/market/summary',
      authentication: 'required'
    });
  }

  async listForSale(
    token: string,
    quantity: number,
    price: {
      currency: string;
      amount: string;
    }
  ): Promise<string> {
    const response = await this.client.request<
      ListTokenForSaleResponse,
      ListTokenForSaleRequest
    >({
      authentication: 'required',
      method: 'POST',
      endpoint: `/tokens/${token}/list-for-sale`,
      body: {
        quantity,
        price
      }
    });

    return response.txHash;
  }

  async approveSale(
    token: string,
    quantity: number,
    price: {
      currency: string;
      amount: string;
    }
  ): Promise<ApproveTokenSaleResponse> {
    return this.client.request<
      ApproveTokenSaleResponse,
      ApproveTokenSaleRequest
    >({
      authentication: 'required',
      method: 'POST',
      endpoint: `/tokens/${token}/approve-sale`,
      body: {
        quantity,
        price
      }
    });
  }

  // User

  async getCommunitiesForUser(
    userId: string,
    count?: number,
    page?: number
  ): Promise<GetUserCommunitiesResponse> {
    return this.client.request<GetUserCommunitiesResponse>({
      method: 'GET',
      endpoint: `/users/${userId}/communities`,
      params: {
        count,
        page
      }
    });
  }

  async getUserByUsername(username: string): Promise<GetUserResponse> {
    return this.client.request<GetUserResponse, GetUserByUsernameRequest>({
      method: 'GET',
      endpoint: '/users',
      authentication: 'none',
      params: {
        username
      }
    });
  }

  async getUser(identifier: string): Promise<GetUserResponse> {
    if (isUsername(identifier)) {
      return this.getUserByUsername(identifier);
    }

    return this.client.request<GetUserResponse, GetUserByIdRequest>({
      method: 'GET',
      endpoint: `/users/${identifier}`,
      authentication: 'none'
    });
  }

  async changeEmailAddress(
    token: string,
    password?: string,
    signature?: string
  ): Promise<ChangeEmailAddressResponse> {
    return this.client.request<
      ChangeEmailAddressResponse,
      ChangeEmailAddressRequest
    >({
      method: 'POST',
      endpoint: `/auth/change-email`,
      authentication: 'optional',
      body: { token, password, signature }
    });
  }

  async requestEmailAddressChange(
    email: string
  ): Promise<RequestEmailAddressChangeResponse> {
    return this.client.request<
      RequestEmailAddressChangeResponse,
      RequestEmailAddressChangeRequest
    >({
      method: 'POST',
      endpoint: `/auth/email-change`,
      authentication: 'required',
      body: { email }
    });
  }

  async editUser(data: UserInfo): Promise<EditUserResponse> {
    return this.client.request<EditUserResponse, EditUserRequest>({
      method: 'POST',
      endpoint: '/users/me',
      authentication: 'required',
      body: data
    });
  }

  // Token

  async mintToken(
    token: string,
    protocol = Protocol.ETHEREUM
  ): Promise<string> {
    const response = await this.client.request<
      MintTokenResponse,
      MintTokenRequest
    >({
      method: 'POST',
      endpoint: `/tokens/${token}/mint`,
      authenticated: 'required',
      body: {
        protocol
      }
    });

    return response.txHash;
  }

  async approveMint(
    token: string,
    protocol = Protocol.ETHEREUM
  ): Promise<ApproveMintResponse> {
    return this.client.request<ApproveMintResponse, ApproveMintRequest>({
      method: 'POST',
      endpoint: `/tokens/${token}/approve-mint`,
      authenticated: 'required',
      body: {
        protocol
      }
    });
  }

  async getTokensOwned(
    user: string,
    count?: number,
    page?: number
  ): Promise<GetTokensOwnedResponse> {
    return this.client.request<GetTokensOwnedResponse>({
      method: 'GET',
      endpoint: `/users/${user}/tokens-owned`,
      params: {
        count,
        page
      }
    });
  }

  async getTokensCreated(
    user: string,
    count?: number,
    page?: number
  ): Promise<GetTokensCreatedResponse> {
    return this.client.request<GetTokensCreatedResponse>({
      method: 'GET',
      endpoint: `/users/${user}/tokens-created`,
      params: {
        count,
        page
      }
    });
  }

  async getTokenOwnerships(
    token: string,
    count?: number,
    page?: number
  ): Promise<GetTokenOwnershipsResponse> {
    return this.client.request<GetTokenOwnershipsResponse>({
      method: 'GET',
      endpoint: `/tokens/${token}/ownerships`,
      params: {
        count,
        page
      }
    });
  }

  async getTokenOwnership(
    token: string,
    ownership: string
  ): Promise<TokenOwnershipDTO> {
    const response = await this.client.request<GetTokenOwnershipResponse>({
      method: 'GET',
      endpoint: `/tokens/${token}/ownerships/${ownership}`
    });

    return response.body;
  }

  async getToken(id: string): Promise<TokenDTO> {
    const response = await this.client.request<
      GetTokenResponse,
      GetTokenRequest
    >({
      method: 'GET',
      endpoint: `/tokens/${id}`
    });

    return response.token;
  }

  async createToken(data: TokenData): Promise<string> {
    const response = await this.client.request<
      CreateTokenResponse,
      CreateTokenRequest
    >({
      method: 'PUT',
      endpoint: '/tokens',
      authentication: 'required',
      body: data
    });

    return response.body.token;
  }

  async uploadImageToS3(url: string, file: File): Promise<any> {
    return this.client.request({
      method: 'PUT',
      endpoint: url,
      authentication: 'none',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    });
  }

  async getTokenImageUploadUrl(
    filename: string,
    filetype: string,
    filesize: number
  ): Promise<GetSignedTokenImageUploadUrlResponse> {
    return this.client.request<
      GetSignedTokenImageUploadUrlResponse,
      GetTokenImageUploadUrlRequest
    >({
      method: 'GET',
      endpoint: '/tokens/image-upload-url',
      authentication: 'required',
      params: {
        filename,
        filetype,
        filesize
      }
    });
  }

  // YouTube

  async getYouTubeUploads(
    playlist?: string,
    page?: string,
    count = 2
  ): Promise<{
    videos: YouTubeVideo[];
    count: number;
    playlist: string;
    nextPage: string;
  }> {
    const response = await this.client.request<
      GetOwnUploadsResponse,
      GetOwnUploadsRequest
    >({
      method: 'GET',
      endpoint: '/youtube/uploads',
      authentication: 'required',
      params: {
        count,
        playlist,
        page
      }
    });

    return {
      videos: response.videos,
      count: response.count,
      playlist: response.playlist,
      nextPage: response.nextPage
    };
  }

  // Google

  async unlinkGoogle(): Promise<void> {
    await this.client.request<UnlinkOAuthResponse, UnlinkOAuthRequest>({
      method: 'POST',
      endpoint: '/google/unlink',
      authentication: 'required'
    });
  }

  async isGoogleLinked(): Promise<boolean> {
    const response = await this.client.request<
      OAuthCheckLinkResponse,
      OAuthCheckLinkRequest
    >({
      method: 'GET',
      endpoint: '/google/linked',
      authentication: 'required'
    });

    return response.linked;
  }

  async linkGoogle(code: string) {
    await this.client.request<null, OAuthLinkRequest>({
      method: 'POST',
      endpoint: '/google/link',
      authentication: 'required',
      body: {
        code
      }
    });
  }

  async getGoogleOAuthLink(): Promise<string> {
    const response = await this.client.request<
      GetOAuthLinkResponse,
      GetOAuthLinkRequest
    >({
      method: 'GET',
      endpoint: '/google/link',
      authentication: 'required'
    });

    return response.body.link;
  }

  // Referral

  async getReferralSummary(): Promise<GetReferralSummaryResponse> {
    return this.client.request<
      GetReferralSummaryResponse,
      GetReferralSummaryRequest
    >({
      method: 'GET',
      endpoint: '/users/referral',
      authentication: 'required'
    });
  }

  // Creator Mode

  async enableCreatorMode(code: string): Promise<EnableCreatorModeResponse> {
    return this.client.request<
      EnableCreatorModeResponse,
      EnableCreatorModeRequest
    >({
      method: 'POST',
      endpoint: '/users/enable-creator',
      authentication: 'required',
      body: { code }
    });
  }

  // Waitlist

  async joinWaitlist(
    entryType: WaitlistEntryType,
    emailAddress: string,
    useWallet: boolean,
    walletAddress?: string,
    socialMedia?: string
  ): Promise<JoinWaitlistResponse> {
    return this.client.request<JoinWaitlistResponse, JoinWaitlistRequest>({
      method: 'POST',
      endpoint: '/waitlist',
      authentication: 'none',
      body: {
        type: entryType,
        emailAddress,
        useWallet,
        walletAddress,
        socialMedia
      }
    });
  }

  // Auth

  signOut(): Promise<SignOutResponse> {
    return this.client.request<SignOutResponse, SignOutRequest>({
      method: 'POST',
      authentication: 'required',
      endpoint: '/auth/signout'
    });
  }

  async doAuthPrecheck(identifier: string): Promise<AuthPrecheckResponse> {
    return this.client.request<AuthPrecheckResponse, AuthPrecheckRequest>({
      method: 'POST',
      endpoint: '/auth/precheck',
      authentication: 'none',
      body: {
        identifier
      }
    });
  }

  async loginWithEmail(
    email: string,
    password: string,
    code: string
  ): Promise<LoginResponse> {
    return this.client.request<LoginResponse, LoginWithEmailRequest>({
      method: 'POST',
      endpoint: '/auth/login/email',
      authentication: 'none',
      body: {
        email,
        password,
        code
      }
    });
  }

  async loginWithWallet(
    protocol = Protocol.ETHEREUM,
    code: string,
    signature: string
  ): Promise<LoginResponse> {
    return this.client.request<LoginResponse, LoginWithWalletRequest>({
      method: 'POST',
      endpoint: '/auth/login/wallet',
      authentication: 'none',
      body: {
        protocol,
        code,
        signature
      }
    });
  }

  async identifyWithWallet(
    address: string,
    invite?: string,
    protocol = Protocol.ETHEREUM
  ): Promise<{ code: string; message: string }> {
    const response = await this.client.request<
      IdentifyWithWalletResponse,
      IdentifyWithWalletRequest
    >({
      method: 'POST',
      endpoint: '/auth/identify/wallet',
      authentication: 'none',
      body: {
        protocol,
        address,
        invite
      }
    });

    const { code, message } = response.body;

    return { code, message };
  }

  async identifyWithEmail(
    email: string,
    password: string,
    invite?: string
  ): Promise<void> {
    await this.client.request<
      IdentifyWithEmailResponse,
      IdentifyWithEmailRequest
    >({
      method: 'POST',
      endpoint: '/auth/identify/email',
      authentication: 'none',
      body: { email, password, invite }
    });
  }
}

export default ApiClient;
