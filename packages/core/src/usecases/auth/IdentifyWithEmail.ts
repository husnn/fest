import { EthereumService, MailService } from '../../services';
import { UserRepository, WalletRepository } from '../../repositories';

import { AuthCheck } from '@fanbase/core';
import { AuthError } from './errors';
import { LoginCodeEmail } from '../../emails';
import { Result } from '../../Result';
import UseCase from '../../base/UseCase';
import { User } from '../../entities';
import { generateUserId } from '../../utils';
import { isValidPassword } from '@fanbase/shared';

export interface IdentifyWithEmailInput {
  email: string;
  password: string;
  invite?: string;
}

export interface IdentifyWithEmailOutput {
  user: string;
}

export class IdentifyWithEmail extends UseCase<
  IdentifyWithEmailInput,
  IdentifyWithEmailOutput
> {
  private userRepository: UserRepository;
  private walletRepository: WalletRepository;

  private ethereumService: EthereumService;
  private mailService: MailService;

  private authCheck: AuthCheck;

  constructor(
    userRepository: UserRepository,
    walletRepository: WalletRepository,
    ethereumService: EthereumService,
    mailService: MailService,
    authCheck: AuthCheck
  ) {
    super();

    this.userRepository = userRepository;
    this.walletRepository = walletRepository;

    this.ethereumService = ethereumService;
    this.mailService = mailService;

    this.authCheck = authCheck;
  }

  async exec(
    data: IdentifyWithEmailInput
  ): Promise<Result<IdentifyWithEmailOutput>> {
    if (!isValidPassword(data.password))
      return Result.fail(AuthError.PASSWORD_INVALID);

    let user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      const check = await this.authCheck.exec({
        email: data.email,
        inviteCode: data.invite
      });

      if (!check.success) return Result.fail(check.error);

      user = new User({
        id: generateUserId(),
        email: data.email.trim().toLowerCase(), // @BeforeInsert Trim and convert to lowercase
        password: data.password,
        isCreator: check.data.isCreator
      });

      await user.hashPassword();

      user = await this.userRepository.create(user);

      let wallet = await this.ethereumService.generateWallet();
      wallet.ownerId = user.id;

      wallet = await this.walletRepository.create(wallet);

      user.walletId = wallet.id;
      user = await this.userRepository.update(user);
    } else {
      user.loginCode = User.newLoginCode();
      user = await this.userRepository.update(user);
    }

    this.mailService.send(new LoginCodeEmail(data.email, user.loginCode.value));

    return Result.ok({ user: user.id });
  }
}
