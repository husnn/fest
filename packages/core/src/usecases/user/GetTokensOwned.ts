import { TokenOwnedDTO } from '@fanbase/shared';

import UseCase from '../../base/UseCase';
import { TokenOwnership } from '../../entities';
import { mapOwnershipToTokenOwnedDTO } from '../../mappers/tokenOwned.mapper';
import { TokenOwnershipRepository, UserRepository } from '../../repositories';
import Result from '../../Result';

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
      (ownership: TokenOwnership) => mapOwnershipToTokenOwnedDTO(ownership)
    );

    return Result.ok({ tokens: tokensOwned, total: result.total });
  }
}
