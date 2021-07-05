import { CurrentUserDTO, isExpired } from '@fanbase/shared';

import UseCase from '../../base/UseCase';
import { User } from '../../entities';
import { mapUserToCurrentDTO } from '../../mappers';
import { WalletRepository } from '../../repositories';
import UserRepository from '../../repositories/UserRepository';
import { Result } from '../../Result';
import { LoginError } from './errors';

export interface LoginWithEmailInput {
  email: string;
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
  private walletRepository: WalletRepository;

  constructor(
    userRepository: UserRepository,
    walletRepository: WalletRepository
  ) {
    super();
    this.userRepository = userRepository;
    this.walletRepository = walletRepository;
  }

  async exec(data: LoginWithEmailInput): Promise<Result<LoginWithEmailOutput>> {
    const user = await this.userRepository.findByEmail(
      data.email,
      'user.loginCode'
    );

    const { value: code, expiry } = user.loginCode;

    if (code !== data.code) {
      return Result.fail(LoginError.CODE_INCORRECT);
    }

    if (isExpired(expiry)) {
      return Result.fail(LoginError.CODE_EXPIRED);
    }

    user.loginCode.expiry = new Date();
    this.userRepository.update(user);

    // user.wallet = await this.walletRepository.get(user.walletId);
    // console.log(user.wallet);

    return Result.ok({
      token: User.generateJwt(user),
      user: mapUserToCurrentDTO(user)
    });
  }
}
