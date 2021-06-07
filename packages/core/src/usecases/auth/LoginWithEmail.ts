import { isExpired, User } from '@fanbase/shared';

import UseCase from '../../base/UseCase';
import UserRepository from '../../repositories/UserRepository';
import { Result } from '../../Result';
import { LoginError } from './errors';

export interface LoginWithEmailInput {
  email: string;
  code: string;
}

export interface LoginWithEmailOutput {
  token: string;
  user: User;
}

export class LoginWithEmail extends UseCase<
  LoginWithEmailInput,
  LoginWithEmailOutput
> {
  private userRepository: UserRepository;

  constructor (userRepository: UserRepository) {
    super();

    this.userRepository = userRepository;
  }

  async exec (data: LoginWithEmailInput): Promise<Result<LoginWithEmailOutput>> {
    const user = await this.userRepository.findByEmail(data.email);

    const { value: code, expiry } = user.loginCode;

    if (code !== data.code) {
      return Result.fail(LoginError.CODE_INCORRECT);
    }

    if (isExpired(expiry)) {
      console.log('expired');
      return Result.fail(LoginError.CODE_EXPIRED);
    }

    user.loginCode.expiry = new Date();
    this.userRepository.update(user);

    return Result.ok({
      token: User.generateJwt(user),
      user
    });
  }
}
