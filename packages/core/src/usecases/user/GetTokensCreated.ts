import UseCase from '../../base/UseCase';
import { Token } from '../../entities';
import { TokenRepository } from '../../repositories';
import { Result } from '../../Result';

export interface GetTokensCreatedInput {
  user: string;
}

export type GetTokensCreatedOutput = Token[];

export class GetTokensCreated extends UseCase<
  GetTokensCreatedInput,
  GetTokensCreatedOutput
> {
  private tokenRepository: TokenRepository;

  constructor(tokenRepository: TokenRepository) {
    super();

    this.tokenRepository = tokenRepository;
  }

  async exec(
    data: GetTokensCreatedInput
  ): Promise<Result<GetTokensCreatedOutput>> {
    const tokens = await this.tokenRepository.findByCreator(data.user);
    return Result.ok(tokens);
  }
}
