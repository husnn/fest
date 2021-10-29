import { CurrentUserDTO, isExpired } from '@fanbase/shared';

import { AuthError } from './errors';
import { Result } from '../../Result';
import UseCase from '../../base/UseCase';
import { User } from '../../entities';
import UserRepository from '../../repositories/UserRepository';
import { isProduction } from '../../config';

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
    const user = await this.userRepository.findByEmail(
      data.email.trim().toLowerCase(),
      ['password', 'loginCode']
    );

    const isPasswordCorrect = await User.verifyPassword(
      data.password,
      user.password
    );
    if (!isPasswordCorrect) return Result.fail(AuthError.PASSWORD_INCORRECT);

    const { value: code, expiry } = user.loginCode;

    if (isProduction && code !== data.code) {
      return Result.fail(AuthError.CODE_INCORRECT);
    }

    if (isExpired(expiry)) {
      return Result.fail(AuthError.CODE_EXPIRED);
    }

    const userDTO = new CurrentUserDTO(user);

    user.loginCode.expiry = new Date();
    user.lastLogin = new Date();

    this.userRepository.update(user);

    return Result.ok({
      token: User.generateJwt(user),
      user: userDTO
    });
  }
}
