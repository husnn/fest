import { InviteRepository, UserRepository } from '../../repositories';

import { Invite } from '../../entities';
import { InviteError } from './errors';
import { InviteType } from '@fest/shared';
import Result from '../../Result';
import UseCase from '../../base/UseCase';

type EnableCreatorModeInput = {
  user: string;
  code: string;
};

type EnableCreatorModeOutput = null;

export class EnableCreatorMode extends UseCase<
  EnableCreatorModeInput,
  EnableCreatorModeOutput
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
    data: EnableCreatorModeInput
  ): Promise<Result<EnableCreatorModeOutput>> {
    const invite = await this.inviteRepository.findByCode(data.code);
    if (!invite) return Result.fail(InviteError.INVITE_NOT_FOUND);

    if (invite.ownerId === data.user) return Result.fail(InviteError.OWN_CODE);
    if (invite.type !== InviteType.CREATOR)
      return Result.fail(InviteError.INVITE_INVALID);
    if (!Invite.validate(invite))
      return Result.fail(InviteError.INVITE_INVALID);

    const user = await this.userRepository.get(data.user);
    if (user.isCreator) return Result.fail(InviteError.USER_INELIGIBLE);

    user.isCreator = true;

    await this.inviteRepository.update(Invite.use(invite));
    await this.userRepository.update(user);

    return Result.ok();
  }
}
