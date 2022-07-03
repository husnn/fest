import { CommunityRepository, TokenRepository } from '../../repositories';
import { Result, TokenDTO } from '@fest/shared';

import UseCase from '../../base/UseCase';

export interface GetTokenInput {
  id: string;
}

export interface GetTokenOutput {
  token: TokenDTO;
}

export class GetToken extends UseCase<GetTokenInput, GetTokenOutput> {
  private tokenRepository: TokenRepository;
  private communityRepository: CommunityRepository;

  constructor(
    tokenRepository: TokenRepository,
    communityRepository: CommunityRepository
  ) {
    super();

    this.tokenRepository = tokenRepository;
    this.communityRepository = communityRepository;
  }

  async exec(data: GetTokenInput): Promise<Result<GetTokenOutput>> {
    const token = await this.tokenRepository.get(data.id, [
      'creator',
      'creator.wallet',
      'communities',
      'communities.creator'
    ]);

    return token
      ? Result.ok({
          token: new TokenDTO(token)
        })
      : Result.fail();
  }
}
