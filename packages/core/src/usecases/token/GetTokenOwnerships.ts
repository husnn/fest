import { Result } from '@fest/shared';
import { TokenOwnership } from '../../entities';
import { TokenOwnershipDTO } from '@fest/shared';
import { TokenOwnershipRepository } from '../../repositories';
import UseCase from '../../base/UseCase';

export interface GetTokenOwnershipsInput {
  token: string;
  count: number;
  page: number;
}

export type GetTokenOwnershipsOutput = {
  ownerships: TokenOwnershipDTO[];
  total: number;
};

export class GetTokenOwnerships extends UseCase<
  GetTokenOwnershipsInput,
  GetTokenOwnershipsOutput
> {
  private tokenOwnershipRepository: TokenOwnershipRepository;

  constructor(tokenOwnershipRepository: TokenOwnershipRepository) {
    super();

    this.tokenOwnershipRepository = tokenOwnershipRepository;
  }

  async exec(
    data: GetTokenOwnershipsInput
  ): Promise<Result<GetTokenOwnershipsOutput>> {
    const result = await this.tokenOwnershipRepository.findByToken(
      data.token,
      data.count,
      data.page
    );

    const ownerships: TokenOwnershipDTO[] = result.ownerships.map(
      (ownership: TokenOwnership) => new TokenOwnershipDTO(ownership)
    );

    return Result.ok({ ownerships, total: result.total });
  }
}
