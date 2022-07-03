import {
  CommunityRepository,
  OAuthRepository,
  TokenOwnershipRepository,
  WalletRepository
} from '../../repositories';
import { OAuthProvider, Protocol } from '@fest/shared';

import DiscordService from '../../services/DiscordService';
import { OAuth } from '../../entities';
import { Result } from '@fest/shared';
import UseCase from '../../base/UseCase';
import { decryptCommunityId } from './crypt';

export interface LinkDiscordInput {
  user: string;
  code: string;
  guild?: string;
  state?: string;
}
export type LinkDiscordOutput = {
  token?: string;
};

export class LinkDiscord extends UseCase<LinkDiscordInput, LinkDiscordOutput> {
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

  async exec(data: LinkDiscordInput): Promise<Result<LinkDiscordOutput>> {
    let auth = await this.oAuthRepository.findByUser(
      OAuthProvider.DISCORD,
      data.user
    );

    const tokens = await this.discordService.getTokenData(data.code);
    if (!tokens.success) return Result.fail();

    const externalId = await this.discordService.getCurrentUserID(
      tokens.data.accessToken
    );
    if (!externalId.success) return Result.fail();

    if (!auth) {
      auth = new OAuth({
        provider: OAuthProvider.DISCORD,
        userId: data.user
      });
    }

    auth = {
      ...auth,
      ...tokens.data,
      externalId: externalId.data
    };

    await this.oAuthRepository.createOrUpdate(auth);

    if (data.guild) {
      const community = await this.communityRepository.get(
        decryptCommunityId(data.state),
        ['tokens']
      );
      if (!community) return Result.fail();

      const nameResult = await this.discordService.getGuildName(data.guild);
      if (!nameResult.success) return Result.fail();

      await this.communityRepository.update({
        ...community,
        discordGuildId: data.guild,
        discordGuildName: nameResult.data
      });

      return Result.ok<LinkDiscordOutput>({
        token: community.tokens[0].id
      });
    } else {
      const wallet = await this.walletRepository.findByUser(
        Protocol.ETHEREUM,
        data.user
      );
      if (!wallet) return Result.ok<LinkDiscordOutput>({});

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
          this.discordService.addMember(
            c.discordGuildId,
            auth.externalId,
            tokens.data.accessToken
          );
        }
      }
    }

    return Result.ok<LinkDiscordOutput>({});
  }
}
