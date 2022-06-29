import { CommunityRepository } from '../../repositories';
import DiscordService from '../../services/DiscordService';
import { OAuth } from '../../entities';
import { OAuthProvider } from '@fest/shared';
import OAuthRepository from '../../repositories/OAuthRepository';
import { Result } from '../../Result';
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
  private communityRepository: CommunityRepository;
  private discordService: DiscordService;

  constructor(
    oAuthRepository: OAuthRepository,
    communityRepository: CommunityRepository,
    discordService: DiscordService
  ) {
    super();

    this.oAuthRepository = oAuthRepository;
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

    if (!auth) {
      auth = new OAuth({
        provider: OAuthProvider.DISCORD,
        userId: data.user
      });
    }

    auth = {
      ...auth,
      ...tokens.data
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
    }

    return Result.ok<LinkDiscordOutput>({});
  }
}
