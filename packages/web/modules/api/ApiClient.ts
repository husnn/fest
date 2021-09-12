import {
    ApproveMintRequest, ApproveMintResponse, ApproveTokenSaleRequest, ApproveTokenSaleResponse,
    BuyTokenListingRequest, BuyTokenListingResponse, CancelTokenListingRequest,
    CancelTokenListingResponse, CreateTokenRequest, CreateTokenResponse, EditUserRequest,
    EditUserResponse, GetListingsForTokenRequest, GetListingsForTokenResponse, GetOAuthLinkRequest,
    GetOAuthLinkResponse, GetOwnUploadsRequest, GetOwnUploadsResponse,
    GetTokenImageUploadUrlRequest, GetTokenImageUploadUrlResponse, GetTokenMarketSummaryRequest,
    GetTokenMarketSummaryResponse, GetTokenOwnershipResponse, GetTokenOwnershipsResponse,
    GetTokenRequest, GetTokenResponse, GetTokensCreatedResponse, GetTokensOwnedResponse,
    GetUserByIdRequest, GetUserByUsernameRequest, GetUserResponse, IdentifyWithEmailRequest,
    IdentifyWithEmailResponse, IdentifyWithWalletRequest, IdentifyWithWalletResponse, isUsername,
    ListTokenForSaleRequest, ListTokenForSaleResponse, LoginResponse, LoginWithEmailRequest,
    LoginWithWalletRequest, MintTokenRequest, MintTokenResponse, OAuthCheckLinkRequest,
    OAuthCheckLinkResponse, OAuthLinkRequest, Price, Protocol, TokenData, TokenDTO,
    TokenOwnershipDTO, UnlinkOAuthRequest, UnlinkOAuthResponse, UserInfo, YouTubeVideo
} from '@fanbase/shared';

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

  // Token Market

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

  async editUser(data: UserInfo): Promise<EditUserResponse> {
    return this.client.request<EditUserResponse, EditUserRequest>({
      method: 'POST',
      endpoint: '/me',
      authenticated: 'required',
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
      body: file
      // headers: {
      //   'Content-Type': file.type
      // }
    });
  }

  async getTokenImageUploadUrl(
    filename: string,
    filetype: string
  ): Promise<GetTokenImageUploadUrlResponse> {
    return this.client.request<
      GetTokenImageUploadUrlResponse,
      GetTokenImageUploadUrlRequest
    >({
      method: 'GET',
      endpoint: '/tokens/image-upload-url',
      authentication: 'required',
      params: {
        filename,
        filetype
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

  // Auth

  async loginWithEmail(email: string, code: string): Promise<LoginResponse> {
    return this.client.request<LoginResponse, LoginWithEmailRequest>({
      method: 'POST',
      endpoint: '/auth/login/email',
      authentication: 'none',
      body: {
        email,
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
        address
      }
    });

    const { code, message } = response.body;

    return { code, message };
  }

  async identifyWithEmail(email: string): Promise<void> {
    await this.client.request<
      IdentifyWithEmailResponse,
      IdentifyWithEmailRequest
    >({
      method: 'POST',
      endpoint: '/auth/identify/email',
      authentication: 'none',
      body: { email }
    });
  }
}

export default ApiClient;
