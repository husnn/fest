import { Result } from '@fest/shared';
import { TokenOwnershipDTO } from '@fest/shared';
import { TokenOwnershipRepository } from '../../repositories';
import UseCase from '../../base/UseCase';

export interface GetTokenOwnershipInput {
  ownership: string;
}

export type GetTokenOwnershipOutput = TokenOwnershipDTO;

export class GetTokenOwnership extends UseCase<
  GetTokenOwnershipInput,
  GetTokenOwnershipOutput
> {
  private tokenOwnershipRepository: TokenOwnershipRepository;

  constructor(tokenOwnershipRepository: TokenOwnershipRepository) {
    super();

    this.tokenOwnershipRepository = tokenOwnershipRepository;
  }

  async exec(
    data: GetTokenOwnershipInput
  ): Promise<Result<GetTokenOwnershipOutput>> {
    const ownership = await this.tokenOwnershipRepository.get(data.ownership);

    return ownership
      ? Result.ok(new TokenOwnershipDTO(ownership))
      : Result.fail();
  }
}
