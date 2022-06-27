import DiscordService from '../../services/DiscordService';
import { OAuth } from '../../entities';
import { OAuthProvider } from '@fest/shared';
import OAuthRepository from '../../repositories/OAuthRepository';
import { Result } from '../../Result';
import UseCase from '../../base/UseCase';

export interface LinkDiscordInput {
  user: string;
  code: string;
}
export type LinkDiscordOutput = any;

export class LinkDiscord extends UseCase<LinkDiscordInput, LinkDiscordOutput> {
  private oAuthRepository: OAuthRepository;
  private discordService: DiscordService;

  constructor(
    oAuthRepository: OAuthRepository,
    discordService: DiscordService
  ) {
    super();

    this.oAuthRepository = oAuthRepository;
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

    return Result.ok<LinkDiscordOutput>();
  }
}
