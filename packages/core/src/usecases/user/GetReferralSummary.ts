import { InviteDTO, Result } from '@fest/shared';
import { InviteRepository, UserRepository } from '../../repositories';

import { Invite } from '../../entities/Invite';
import UseCase from '../../base/UseCase';

type GetReferralSummaryInput = {
  user: string;
};

type GetReferralSummaryOutput = {
  invites: InviteDTO[];
  total: number;
};

export class GetReferralSummary extends UseCase<
  GetReferralSummaryInput,
  GetReferralSummaryOutput
> {
  private userRepository: UserRepository;
  private inviteRepository: InviteRepository;

  constructor(
    userRepository: UserRepository,
    inviteRepository: InviteRepository
  ) {
    super();

    this.userRepository = userRepository;
    this.inviteRepository = inviteRepository;
  }

  async exec(
    data: GetReferralSummaryInput
  ): Promise<Result<GetReferralSummaryOutput>> {
    const user = await this.userRepository.get(data.user);
    if (!user) return Result.fail();

    const query = await this.inviteRepository.findByOwner(data.user);

    return Result.ok({
      invites: query.invites.map((invite: Invite) => new InviteDTO(invite)),
      total: query.total
    });
  }
}
