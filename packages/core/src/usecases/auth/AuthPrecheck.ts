import Result from '../../Result';
import UseCase from '../../base/UseCase';
import { UserRepository } from '../../repositories';
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

  constructor(userRepository: UserRepository) {
    super();

    this.userRepository = userRepository;
  }

  async exec(data: AuthPrecheckInput): Promise<Result<AuthPrecheckOutput>> {
    const user = await this.userRepository.findByEmailOrWallet(data.identifier);

    return Result.ok({
      exists: !!user,
      needsInvite: isInviteOnly
    });
  }
}
