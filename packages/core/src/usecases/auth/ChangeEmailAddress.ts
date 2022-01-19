import { EthereumService, MailService } from '../../services';
import { WalletType, isEmailAddress, isExpired } from '@fanbase/shared';

import { EmailAddressChangeError } from './errors';
import Result from '../../Result';
import UseCase from '../../base/UseCase';
import { User } from '../../entities';
import { UserRepository } from '../../repositories';

export type ChangeEmailAddressInput = {
  token: string;
  password?: string;
  signature?: string;
};

export type ChangeEmailAddressOutput = {
  email: string;
};

export class ChangeEmailAddress extends UseCase<
  ChangeEmailAddressInput,
  ChangeEmailAddressOutput
> {
  private userRepository: UserRepository;
  private ethereumService: EthereumService;
  private mailService: MailService;

  constructor(
    userRepository: UserRepository,
    ethereumService: EthereumService,
    mailService: MailService
  ) {
    super();

    this.userRepository = userRepository;
    this.ethereumService = ethereumService;
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

    if (user.wallet.type == WalletType.INTERNAL) {
      const isPasswordCorrect = await User.verifyPassword(
        data.password,
        user.password
      );
      if (!isPasswordCorrect)
        return Result.fail(EmailAddressChangeError.INCORRECT_PASSWORD);
    } else {
      const recoveredAddress = this.ethereumService.recoverAddress(
        data.token,
        data.signature
      );
      if (
        !recoveredAddress.success ||
        recoveredAddress.data?.address !== user.wallet.address
      )
        return Result.fail(EmailAddressChangeError.INVALID_SIGNATURE);
    }

    const newEmailAddress = recovered.email.trim().toLowerCase();

    user.email = newEmailAddress;
    user.emailChangeToken.expiry = new Date();

    await this.userRepository.update(user);

    return Result.ok({ email: newEmailAddress });
  }
}

export default ChangeEmailAddress;
