import UseCase from '../../base/UseCase';
import { LoginCodeEmail } from '../../emails';
import { User } from '../../entities';
import UserRepository from '../../repositories/UserRepository';
import WalletRepository from '../../repositories/WalletRepository';
import { Result } from '../../Result';
import { EthereumService, MailService } from '../../services';

export interface IdentifyWithEmailInput {
  email: string;
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

  constructor(
    userRepository: UserRepository,
    walletRepository: WalletRepository,
    ethereumService: EthereumService,
    mailService: MailService
  ) {
    super();

    this.userRepository = userRepository;
    this.walletRepository = walletRepository;
    this.ethereumService = ethereumService;
    this.mailService = mailService;
  }

  async exec(
    data: IdentifyWithEmailInput
  ): Promise<Result<IdentifyWithEmailOutput>> {
    let user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      user = new User({
        email: data.email.trim().toLowerCase() // @BeforeInsert Trim and convert to lowercase
      });

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

    this.mailService.send(new LoginCodeEmail(user.email, user.loginCode.value));

    return Result.ok({ user: user.id });
  }
}
