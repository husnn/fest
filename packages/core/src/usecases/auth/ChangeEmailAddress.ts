import { isEmailAddress, isExpired } from '@fanbase/shared';

import { EmailAddressChangeError } from './errors';
import { MailService } from '../../services';
import Result from '../../Result';
import UseCase from '../../base/UseCase';
import { User } from '../../entities';
import { UserRepository } from '../../repositories';

export type ChangeEmailAddressInput = {
  token: string;
  password: string;
};

export type ChangeEmailAddressOutput = {
  email: string;
};

export class ChangeEmailAddress extends UseCase<
  ChangeEmailAddressInput,
  ChangeEmailAddressOutput
> {
  private userRepository: UserRepository;
  private mailService: MailService;

  constructor(userRepository: UserRepository, mailService: MailService) {
    super();

    this.userRepository = userRepository;
    this.mailService = mailService;
  }

  async exec(
    data: ChangeEmailAddressInput
  ): Promise<Result<ChangeEmailAddressOutput>> {
    const recovered = User.fromEmailChangeJwt(data.token);
    if (!isEmailAddress(recovered.email)) return Result.fail();

    const user = await this.userRepository.get(recovered.userId, [
      'password',
      'emailChangeToken'
    ]);
    if (!user) return Result.fail();

    if (
      user.emailChangeToken?.value !== data.token ||
      isExpired(user.emailChangeToken?.expiry)
    )
      return Result.fail(EmailAddressChangeError.INVALID_TOKEN);

    const isPasswordCorrect = await User.verifyPassword(
      data.password,
      user.password
    );
    if (!isPasswordCorrect)
      return Result.fail(EmailAddressChangeError.INCORRECT_PASSWORD);

    const newEmailAddress = recovered.email.trim().toLowerCase();

    user.email = newEmailAddress;
    user.emailChangeToken.expiry = new Date();

    await this.userRepository.update(user);

    return Result.ok({ email: newEmailAddress });
  }
}

export default ChangeEmailAddress;
