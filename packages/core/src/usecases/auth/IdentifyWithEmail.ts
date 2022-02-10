import {
  EthereumService,
  isValidPassword,
  Protocol,
  WalletType
} from '@fest/shared';
import UseCase from '../../base/UseCase';
import { LoginCodeEmail } from '../../emails';
import { User, Wallet } from '../../entities';
import {
  InviteRepository,
  UserRepository,
  WalletRepository
} from '../../repositories';
import { Result } from '../../Result';
import { MailService } from '../../services';
import { generateUserId, generateWalletId } from '../../utils';
import { generateInvitesForNewUser } from '../invites';
import { AuthCheck } from './AuthCheck';
import { AuthError } from './errors';

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

  private inviteRepository: InviteRepository;

  constructor(
    userRepository: UserRepository,
    walletRepository: WalletRepository,
    ethereumService: EthereumService,
    mailService: MailService,
    authCheck: AuthCheck,
    inviteRepository: InviteRepository
  ) {
    super();

    this.userRepository = userRepository;
    this.walletRepository = walletRepository;

    this.ethereumService = ethereumService;
    this.mailService = mailService;

    this.authCheck = authCheck;

    this.inviteRepository = inviteRepository;
  }

  async exec(
    data: IdentifyWithEmailInput
  ): Promise<Result<IdentifyWithEmailOutput>> {
    if (!isValidPassword(data.password))
      return Result.fail(AuthError.PASSWORD_INVALID);

    const email = data.email.trim().toLowerCase();

    let user = await this.userRepository.findByEmail(email);

    if (!user) {
      const check = await this.authCheck.exec({
        email,
        inviteCode: data.invite
      });

      if (!check.success) return Result.fail(check.error);

      user = new User({
        id: generateUserId()(),
        email, // @BeforeInsert Trim and convert to lowercase
        password: data.password,
        isCreator: check.data.isCreator
      });

      user.password = await User.hashPassword(user.password);

      user = await this.userRepository.create(user);

      const walletData = await this.ethereumService.generateWallet();

      let wallet = new Wallet({
        id: generateWalletId()(),
        type: WalletType.INTERNAL,
        protocol: Protocol.ETHEREUM,
        ownerId: user.id,
        ...walletData
      });

      wallet = await this.walletRepository.create(wallet);

      user.walletId = wallet.id;
      user = await this.userRepository.update(user);

      generateInvitesForNewUser(
        this.inviteRepository,
        user.id,
        check.data.isCreator
      );
    } else {
      user.loginCode = User.newLoginCode();
      user = await this.userRepository.update(user);
    }

    this.mailService.send(new LoginCodeEmail(data.email, user.loginCode.value));

    return Result.ok({ user: user.id });
  }
}
