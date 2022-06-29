import { CommunityRepository } from '../../repositories';
import { DiscordService } from 'core/src/services';
import { Result } from '../../Result';
import UseCase from '../../base/UseCase';
import { encryptCommunityId } from './crypt';

export type GetDiscordLinkInput = {
  user: string;
  community?: string;
};

export type GetDiscordLinkOutput = string;

export class GetDiscordLink extends UseCase<
  GetDiscordLinkInput,
  GetDiscordLinkOutput
> {
  private communityRepository: CommunityRepository;
  private discordService: DiscordService;

  constructor(
    communityRepository: CommunityRepository,
    discordService: DiscordService
  ) {
    super();

    this.communityRepository = communityRepository;
    this.discordService = discordService;
  }

  async exec(data: GetDiscordLinkInput): Promise<Result<GetDiscordLinkOutput>> {
    let salt: string;

    if (data.community) {
      const community = await this.communityRepository.get(data.community);
      if (!community || community.creatorId != data.user) return Result.fail();

      salt = encryptCommunityId(community.id);
    }

    return Result.ok(this.discordService.getOAuthLink(!!data.community, salt));
  }
}
