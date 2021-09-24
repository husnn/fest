import { CurrentUserDTO, isExpired } from '@fanbase/shared';
import { isDevelopment } from '../../config';

import UseCase from '../../base/UseCase';
import { User } from '../../entities';
import { WalletRepository } from '../../repositories';
import UserRepository from '../../repositories/UserRepository';
import { Result } from '../../Result';
import { LoginError } from './errors';

export interface LoginWithEmailInput {
  email: string;
  password: string;
  code: string;
}

export interface LoginWithEmailOutput {
  token: string;
  user: CurrentUserDTO;
}

export class LoginWithEmail extends UseCase<
  LoginWithEmailInput,
  LoginWithEmailOutput
> {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    super();
    this.userRepository = userRepository;
  }

  async exec(data: LoginWithEmailInput): Promise<Result<LoginWithEmailOutput>> {
    const user = await this.userRepository.findByEmail(data.email, [
      'password',
      'loginCode'
    ]);

    const isPasswordCorrect = await User.verifyPassword(
      data.password,
      user.password
    );
    if (!isPasswordCorrect) return Result.fail(LoginError.PASSWORD_INCORRECT);

    const { value: code, expiry } = user.loginCode;

    if (!isDevelopment && code !== data.code) {
      return Result.fail(LoginError.CODE_INCORRECT);
    }

    if (isExpired(expiry)) {
      return Result.fail(LoginError.CODE_EXPIRED);
    }

    user.loginCode.expiry = new Date();
    this.userRepository.update(user);

    return Result.ok({
      token: User.generateJwt(user),
      user: new CurrentUserDTO(user)
    });
  }
}
