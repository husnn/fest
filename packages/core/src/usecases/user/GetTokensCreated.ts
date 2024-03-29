import { Result } from '@fest/shared';
import { Token } from '../../entities';
import { TokenDTO } from '@fest/shared';
import { TokenRepository } from '../../repositories';
import UseCase from '../../base/UseCase';

export interface GetTokensCreatedInput {
  user: string;
  count: number;
  page: number;
}

export type GetTokensCreatedOutput = {
  tokens: TokenDTO[];
  total: number;
};

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
    const result = await this.tokenRepository.findByCreator(
      data.user,
      data.count,
      data.page
    );

    const tokensCreated = result.tokens.map(
      (token: Token) => new TokenDTO(token)
    );

    return Result.ok({
      tokens: tokensCreated,
      total: result.total
    });
  }
}
