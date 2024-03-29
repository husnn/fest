import { TokenOwnershipRepository, UserRepository } from '../../repositories';

import { Result } from '@fest/shared';
import { TokenOwnedDTO } from '@fest/shared';
import { TokenOwnership } from '../../entities';
import UseCase from '../../base/UseCase';

export interface GetTokensOwnedInput {
  user: string;
  count: number;
  page: number;
}

export type GetTokensOwnedOutput = {
  tokens: TokenOwnedDTO[];
  total: number;
};

export class GetTokensOwned extends UseCase<
  GetTokensOwnedInput,
  GetTokensOwnedOutput
> {
  private userRepository: UserRepository;
  private tokenOwnershipRepository: TokenOwnershipRepository;

  constructor(
    userRepository: UserRepository,
    tokenOwnershipRepository: TokenOwnershipRepository
  ) {
    super();

    this.userRepository = userRepository;
    this.tokenOwnershipRepository = tokenOwnershipRepository;
  }

  async exec(data: GetTokensOwnedInput): Promise<Result<GetTokensOwnedOutput>> {
    const user = await this.userRepository.get(data.user);

    const result = await this.tokenOwnershipRepository.findByWallet(
      user.walletId,
      data.count,
      data.page
    );

    const tokensOwned: TokenOwnedDTO[] = result.ownerships.map(
      (ownership: TokenOwnership) =>
        new TokenOwnedDTO({ ownership, ...ownership.token })
    );

    return Result.ok({ tokens: tokensOwned, total: result.total });
  }
}
