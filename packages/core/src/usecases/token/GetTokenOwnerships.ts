import { TokenOwnershipDTO as TokenOwnershipDTO } from '@fest/shared';

import UseCase from '../../base/UseCase';
import { TokenOwnership } from '../../entities';
import { TokenOwnershipRepository } from '../../repositories';
import Result from '../../Result';

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
