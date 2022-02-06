import { CurrentUserDTO, decryptText, isExpired, Protocol } from '@fest/shared';
import UseCase from '../../base/UseCase';
import { User } from '../../entities';
import UserRepository from '../../repositories/UserRepository';
import WalletRepository from '../../repositories/WalletRepository';
import { Result } from '../../Result';
import { EthereumService } from '../../services';
import { AuthError } from './errors';
import { msgToSign } from './IdentifyWithWallet';

export interface LoginWithWalletInput {
  protocol: Protocol;
  code: string;
  signature: string;
  ip: string;
}

export interface LoginWithWalletOuput {
  token: string;
  expiry: number;
  user: CurrentUserDTO;
}

export class LoginWithWallet extends UseCase<
  LoginWithWalletInput,
  LoginWithWalletOuput
> {
  private userRepository: UserRepository;
  private walletRepository: WalletRepository;
  private ethereumService: EthereumService;

  constructor(
    userRepository: UserRepository,
    walletRepository: WalletRepository,
    ethereumService: EthereumService
  ) {
    super();

    this.userRepository = userRepository;
    this.walletRepository = walletRepository;
    this.ethereumService = ethereumService;
  }

  async exec(
    data: LoginWithWalletInput
  ): Promise<Result<LoginWithWalletOuput>> {
    const recoverResult = this.ethereumService.recoverAddress(
      msgToSign(data.code),
      data.signature
    );

    const wallet = await this.walletRepository.findByAddress(
      data.protocol,
      recoverResult.data.address
    );

    const user = await this.userRepository.get(wallet.ownerId, ['loginCode']);

    const { value: code, expiry } = user.loginCode;

    const decryptedCode = decryptText(data.code);

    if (code !== decryptedCode) {
      return Result.fail(AuthError.CODE_INCORRECT);
    }

    if (isExpired(expiry)) {
      return Result.fail(AuthError.CODE_EXPIRED);
    }

    // user.wallet = wallet;

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
