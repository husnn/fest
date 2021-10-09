import { UserRepository, WaitlistRepository } from '../../repositories';

import Result from '../../Result';
import UseCase from '../../base/UseCase';
import { isInviteOnly } from '../../config';

type AuthPrecheckInput = {
  identifier?: string;
};

type AuthPrecheckOutput = {
  exists: boolean;
  needsInvite: boolean;
};

export class AuthPrecheck extends UseCase<
  AuthPrecheckInput,
  AuthPrecheckOutput
> {
  private userRepository: UserRepository;
  private waitlistRepository: WaitlistRepository;

  constructor(
    userRepository: UserRepository,
    waitlistRepository: WaitlistRepository
  ) {
    super();

    this.userRepository = userRepository;
    this.waitlistRepository = waitlistRepository;
  }

  async exec(data: AuthPrecheckInput): Promise<Result<AuthPrecheckOutput>> {
    let needsInvite = false;

    const user = await this.userRepository.findByEmailOrWallet(data.identifier);

    if (isInviteOnly) {
      const entry = await this.waitlistRepository.findByEmailOrWallet(
        data.identifier
      );
      needsInvite = !entry || !entry.isAccepted;
    }

    return Result.ok({
      exists: !!user,
      needsInvite
    });
  }
}
