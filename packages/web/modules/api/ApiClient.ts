import {
    ApproveMintRequest, ApproveMintResponse, CreateTokenRequest, CreateTokenResponse, CurrentUser,
    EditUserRequest, EditUserResponse, GetOAuthLinkRequest, GetOAuthLinkResponse,
    GetOwnUploadsRequest, GetOwnUploadsResponse, GetTokenRequest, GetTokenResponse,
    GetTokensCreatedResponse, GetUserByIdRequest, GetUserByUsernameRequest, GetUserResponse,
    IdentifyWithEmailRequest, IdentifyWithEmailResponse, IdentifyWithWalletRequest,
    IdentifyWithWalletResponse, isUUID, LoginWithEmailRequest, LoginWithEmailResponse,
    LoginWithWalletRequest, LoginWithWalletResponse, OAuthCheckLinkRequest, OAuthCheckLinkResponse,
    OAuthLinkRequest, Protocol, Token, TokenData, UnlinkOAuthRequest, UnlinkOAuthResponse, UserInfo,
    YouTubeVideo
} from '@fanbase/shared';

import HttpClient from './HttpClient';

export default class ApiClient {
  private client: HttpClient;

  static instance: ApiClient | undefined;

  static getInstance() {
    return this.instance;
  }

  constructor(client: HttpClient) {
    this.client = client;
    ApiClient.instance = this;
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
    if (identifier && isUUID(identifier)) {
      return this.client.request<GetUserResponse, GetUserByIdRequest>({
        method: 'GET',
        endpoint: `/users/${identifier}`,
        authentication: 'none'
      });
    }

    return this.getUserByUsername(identifier);
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

  async approveMint(
    protocol = Protocol.ETHEREUM,
    supply: number
  ): Promise<ApproveMintResponse> {
    return this.client.request<ApproveMintResponse, ApproveMintRequest>({
      method: 'POST',
      endpoint: '/tokens/approve-mint',
      authenticated: 'required',
      body: {
        protocol,
        supply
      }
    });
  }

  async getTokensCreated(user: string): Promise<Token[]> {
    const response = await this.client.request<GetTokensCreatedResponse>({
      method: 'GET',
      endpoint: `/users/${user}/tokens/created`
    });

    return response.body.tokens;
  }

  async getToken(id: string): Promise<Token> {
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

  async loginWithEmail(
    email: string,
    code: string
  ): Promise<{
    token: string;
    user: CurrentUser;
  }> {
    const response = await this.client.request<
      LoginWithEmailResponse,
      LoginWithEmailRequest
    >({
      method: 'POST',
      endpoint: '/auth/login/email',
      authentication: 'none',
      body: {
        email,
        code
      }
    });

    return {
      token: response.token,
      user: response.user
    };
  }

  async loginWithWallet(
    protocol = Protocol.ETHEREUM,
    code: string,
    signature: string
  ): Promise<{
    token: string;
    user: CurrentUser;
  }> {
    const response = await this.client.request<
      LoginWithWalletResponse,
      LoginWithWalletRequest
    >({
      method: 'POST',
      endpoint: '/auth/login/wallet',
      authentication: 'none',
      body: {
        protocol,
        code,
        signature
      }
    });

    return {
      token: response.token,
      user: response.user
    };
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
