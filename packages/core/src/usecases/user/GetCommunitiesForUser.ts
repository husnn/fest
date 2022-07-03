import { CommunityDTO, Result } from '@fest/shared';

import { Community } from '../../entities';
import { CommunityRepository } from '../../repositories';
import UseCase from '../../base/UseCase';

type GetCommunitiesForUserInput = {
  user: string;
  count: number;
  page: number;
};

type GetCommunitiesForUserOutput = {
  communities: CommunityDTO[];
  total: number;
};

export class GetCommunitiesForUser extends UseCase<
  GetCommunitiesForUserInput,
  GetCommunitiesForUserOutput
> {
  private communityRepository: CommunityRepository;

  constructor(communityRepository: CommunityRepository) {
    super();

    this.communityRepository = communityRepository;
  }

  async exec(
    data: GetCommunitiesForUserInput
  ): Promise<Result<GetCommunitiesForUserOutput>> {
    const result = await this.communityRepository.getAllForUser(
      data.user,
      data.count,
      data.page
    );

    return Result.ok({
      communities: result.communities.map(
        (token: Community) => new CommunityDTO(token)
      ),
      total: result.total
    });
  }
}
