import { CurrentUserDTO, Result, isExpired } from '@fest/shared';

import { AuthError } from './errors';
import UseCase from '../../base/UseCase';
import { User } from '../../entities';
import UserRepository from '../../repositories/UserRepository';
import { isProduction } from '../../config';

export interface LoginWithEmailInput {
  email: string;
  password: string;
  code: string;
  ip: string;
}

export interface LoginWithEmailOutput {
  token: string;
  expiry: number;
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
    if (!isPasswordCorrect)
      return Result.fail(null, AuthError.PASSWORD_INCORRECT);

    const { value: code, expiry } = user.loginCode;

    if (isProduction && code !== data.code) {
      return Result.fail(null, AuthError.CODE_INCORRECT);
    }

    if (isExpired(expiry)) {
      return Result.fail(null, AuthError.CODE_EXPIRED);
    }

    const userDTO = new CurrentUserDTO(user);

    user.loginCode.expiry = new Date();
    user.lastLoginIP = data.ip;
    user.lastLogin = new Date();

    this.userRepository.update(user);

    const token = User.generateJwt(user);

    return Result.ok({
      token,
      expiry: User.getExpiryDate(token),
      user: userDTO
    });
  }
}
