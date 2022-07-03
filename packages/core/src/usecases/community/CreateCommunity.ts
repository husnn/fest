import { CommunityRepository, TokenRepository } from '../../repositories';

import { Community } from '../../entities';
import { Result } from '@fest/shared';
import UseCase from '../../base/UseCase';
import { generateCommunityId } from '../../utils';
import { logger } from '@fest/logger';

type CreateCommunityInput = {
  creator: string;
  name: string;
  tokens: string[];
};

type CreateCommunityOutput = {
  id: string;
};

export class CreateCommunity extends UseCase<
  CreateCommunityInput,
  CreateCommunityOutput
> {
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

  async exec(
    data: CreateCommunityInput
  ): Promise<Result<CreateCommunityOutput>> {
    let tokens = await this.tokenRepository.getBatch(data.tokens);

    tokens = tokens.filter((token) => token.creatorId === data.creator);
    if (tokens.length < 1) return Result.fail();

    let community = new Community({
      id: generateCommunityId()(),
      creatorId: data.creator,
      name: data.name,
      tokens
    });

    community = await this.communityRepository.create(community);

    logger.info('Community created for token(s).', {
      communityId: community.id,
      tokenIds: data.tokens
    });

    return Result.ok({ id: community.id });
  }
}

export default CreateCommunity;
