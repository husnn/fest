import { CommunityDTO, Result } from '@fest/shared';
import { CommunityRepository, UserRepository } from '../../repositories';

import UseCase from '../../base/UseCase';

type GetCommunityInput = {
  id: string;
  user?: string;
};

type GetCommunityOutput = {
  community: CommunityDTO;
  isMember: boolean;
};

export class GetCommunity extends UseCase<
  GetCommunityInput,
  GetCommunityOutput
> {
  private userRepository: UserRepository;
  private communityRepository: CommunityRepository;

  constructor(
    userRepository: UserRepository,
    communityRepository: CommunityRepository
  ) {
    super();

    this.userRepository = userRepository;
    this.communityRepository = communityRepository;
  }

  async exec(data: GetCommunityInput): Promise<Result<GetCommunityOutput>> {
    const user = await this.userRepository.get(data.user);

    const [community, isMember] = await this.communityRepository.getForUser(
      data.id,
      user?.id
    );
    if (!community) return Result.fail();

    return Result.ok({
      community: new CommunityDTO(community),
      isMember
    });
  }
}
