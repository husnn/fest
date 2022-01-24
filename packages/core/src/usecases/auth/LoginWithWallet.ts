import { CurrentUserDTO, Protocol, decryptText, isExpired } from '@fest/shared';

import { AuthError } from './errors';
import { EthereumService } from '../../services';
import { Result } from '../../Result';
import UseCase from '../../base/UseCase';
import { User } from '../../entities';
import UserRepository from '../../repositories/UserRepository';
import WalletRepository from '../../repositories/WalletRepository';
import { msgToSign } from './IdentifyWithWallet';

export interface LoginWithWalletInput {
  protocol: Protocol;
  code: string;
  signature: string;
}

export interface LoginWithWalletOuput {
  token: string;
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
    user.lastLogin = new Date();

    this.userRepository.update(user);

    return Result.ok({
      token: User.generateJwt(user),
      user: userDTO
    });
  }
}
