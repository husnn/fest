import {
  CommunityRepository,
  OAuthRepository,
  TokenOwnershipRepository,
  WalletRepository
} from '../../repositories';
import { OAuthProvider, Protocol } from '@fest/shared';

import DiscordService from '../../services/DiscordService';
import { Result } from '@fest/shared';
import UseCase from '../../base/UseCase';

export interface UnlinkDiscordInput {
  user: string;
}
export type UnlinkDiscordOutput = any;

export class UnlinkDiscord extends UseCase<
  UnlinkDiscordInput,
  UnlinkDiscordOutput
> {
  private oAuthRepository: OAuthRepository;
  private walletRepository: WalletRepository;
  private ownershipRepository: TokenOwnershipRepository;
  private communityRepository: CommunityRepository;
  private discordService: DiscordService;

  constructor(
    oAuthRepository: OAuthRepository,
    walletRepository: WalletRepository,
    ownershipRepository: TokenOwnershipRepository,
    communityRepository: CommunityRepository,
    discordService: DiscordService
  ) {
    super();

    this.oAuthRepository = oAuthRepository;
    this.walletRepository = walletRepository;
    this.ownershipRepository = ownershipRepository;
    this.communityRepository = communityRepository;
    this.discordService = discordService;
  }

  async exec(data: UnlinkDiscordInput): Promise<Result<UnlinkDiscordOutput>> {
    const auth = await this.oAuthRepository.findByUser(
      OAuthProvider.DISCORD,
      data.user
    );

    if (auth) this.discordService.revokeToken(auth.accessToken); // Best-effort

    auth.accessToken = null;
    auth.refreshToken = null;
    auth.expiry = null;

    await this.oAuthRepository.update(auth);

    const wallet = await this.walletRepository.findByUser(
      Protocol.ETHEREUM,
      data.user
    );
    if (wallet) {
      const query = await this.ownershipRepository.findByWallet(
        wallet.id,
        100,
        1
      );
      for (const ownership of query.ownerships) {
        const communities = await this.communityRepository.findByToken(
          ownership.tokenId
        );
        for (const c of communities) {
          this.discordService.kickMember(c.discordGuildId, auth.externalId);
        }
      }
    }

    return Result.ok<UnlinkDiscordOutput>();
  }
}
