import { InviteRepository, WaitlistRepository } from '../../repositories';

import { AuthError } from '../auth/errors';
import { Invite } from '../../entities';
import Result from '../../Result';
import UseCase from '../../base/UseCase';
import { WaitlistEntryType } from '@fanbase/shared';
import { isInviteOnly } from '../../config';

type AuthCheckInput = {
  email?: string;
  wallet?: string;
  inviteCode?: string;
};

type AuthCheckOutput = {
  isCreator: boolean;
  invite?: Invite;
};

export class AuthCheck extends UseCase<AuthCheckInput, AuthCheckOutput> {
  private waitlistRepository: WaitlistRepository;
  private inviteRepository: InviteRepository;

  constructor(
    waitlistRepository: WaitlistRepository,
    inviteRepository: InviteRepository
  ) {
    super();

    this.waitlistRepository = waitlistRepository;
    this.inviteRepository = inviteRepository;
  }

  async exec(data: AuthCheckInput): Promise<Result<AuthCheckOutput>> {
    let invite: Invite;
    let isCreator = false;

    if (isInviteOnly) {
      const entry = await this.waitlistRepository.findByEmailOrWallet(
        data.email || data.wallet
      );

      if (entry) {
        if (!entry.isAccepted && !data.inviteCode)
          return Result.fail(AuthError.INVITE_CODE_MISSING);
        isCreator = entry.type === WaitlistEntryType.CREATOR;
      }
    }

    if (data.inviteCode) {
      invite = await this.inviteRepository.findByCode(data.inviteCode);
      if (!invite) return Result.fail(AuthError.INVITE_NOT_FOUND);

      if (!Invite.validate(invite))
        return Result.fail(AuthError.INVITE_INVALID);

      if (!isCreator) isCreator = invite.isCreator;

      invite = await this.inviteRepository.update(Invite.use(invite));
    }

    return Result.ok({ isCreator, invite });
  }
}
