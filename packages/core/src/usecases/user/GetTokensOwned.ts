import UseCase from '../../base/UseCase';
import { Token, TokenOwnership } from '../../entities';
import { TokenOwnershipRepository, TokenRepository } from '../../repositories';
import { Result } from '../../Result';

export class Owner {
  readonly id: string;
}

export class TokenOwned extends Token {
  ownerId: string;
  owner: Owner;
  quantity: number;

  static from(ownership: TokenOwnership): TokenOwned {
    const owned = new TokenOwned();
    return owned;
  }
}

export interface GetTokensOwnedInput {
  user: string;
}

export type GetTokensOwnedOutput = TokenOwned[];

export class GetTokensOwned extends UseCase<
  GetTokensOwnedInput,
  GetTokensOwnedOutput
> {
  private tokenOwnershipRepository: TokenOwnershipRepository;
  private tokenRepository: TokenRepository;

  constructor(
    tokenOwnershipRepository: TokenOwnershipRepository,
    tokenRepository: TokenRepository
  ) {
    super();

    this.tokenOwnershipRepository = tokenOwnershipRepository;
    this.tokenRepository = tokenRepository;
  }

  async exec(data: GetTokensOwnedInput): Promise<Result<GetTokensOwnedOutput>> {
    const tokenOwnerships = await this.tokenOwnershipRepository.findByOwner(
      data.user
    );

    const tokensOwned: TokenOwned[] = tokenOwnerships.map(
      (ownership: TokenOwnership) => TokenOwned.from(ownership)
    );

    return Result.ok(tokensOwned);
  }
}
