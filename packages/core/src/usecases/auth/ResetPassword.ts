import { AuthError, ResetPasswordError } from './errors';
import { LoginWithEmail, LoginWithEmailOutput } from './LoginWithEmail';
import { Result, isExpired, isValidPassword } from '@fest/shared';

import UseCase from '../../base/UseCase';
import { User } from '../../entities';
import { UserRepository } from '../../repositories';

type ResetPasswordInput = {
  token: string;
  password: string;
  ip: string;
};

type ResetPasswordOutput = LoginWithEmailOutput;

export class ResetPassword extends UseCase<
  ResetPasswordInput,
  ResetPasswordOutput
> {
  private userRepository: UserRepository;
  private loginWithEmailUseCase: LoginWithEmail;

  constructor(userRepository: UserRepository) {
    super();

    this.userRepository = userRepository;
    this.loginWithEmailUseCase = new LoginWithEmail(userRepository);
  }

  async exec(data: ResetPasswordInput): Promise<Result<ResetPasswordOutput>> {
    if (!isValidPassword(data.password))
      return Result.fail(AuthError.PASSWORD_INVALID);

    const user = await this.userRepository.get(
      User.fromResetJwt(data.token).userId,
      ['passwordResetToken', 'loginCode']
    );
    if (!user) return Result.fail();

    if (
      user.passwordResetToken?.value !== data.token ||
      isExpired(user.passwordResetToken?.expiry)
    )
      return Result.fail(ResetPasswordError.INVALID_TOKEN);

    user.passwordResetToken.expiry = new Date();

    user.password = await User.hashPassword(data.password);
    user.loginCode = User.newLoginCode();

    await this.userRepository.update(user);

    return this.loginWithEmailUseCase.exec({
      email: user.email,
      password: data.password,
      code: user.loginCode.value,
      ip: data.ip
    });
  }
}
