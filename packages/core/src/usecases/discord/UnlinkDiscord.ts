import DiscordService from '../../services/DiscordService';
import { OAuthProvider } from '@fest/shared';
import OAuthRepository from '../../repositories/OAuthRepository';
import { Result } from '../../Result';
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
  private discordService: DiscordService;

  constructor(
    oAuthRepository: OAuthRepository,
    discordService: DiscordService
  ) {
    super();

    this.oAuthRepository = oAuthRepository;
    this.discordService = discordService;
  }

  async exec(data: UnlinkDiscordInput): Promise<Result<UnlinkDiscordOutput>> {
    const auth = await this.oAuthRepository.findByUser(
      OAuthProvider.DISCORD,
      data.user
    );

    if (auth) this.discordService.revokeToken(auth.accessToken); // Best-effort

    await this.oAuthRepository.remove(auth);

    return Result.ok<UnlinkDiscordOutput>();
  }
}
