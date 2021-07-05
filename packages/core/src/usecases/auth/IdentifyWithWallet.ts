import { encryptText, Protocol, WalletType } from '@fanbase/shared';

import UseCase from '../../base/UseCase';
import { User, Wallet } from '../../entities';
import UserRepository from '../../repositories/UserRepository';
import WalletRepository from '../../repositories/WalletRepository';
import { Result } from '../../Result';
import { generateUserId, generateWalletId } from '../../utils';

export interface IdentifyWithWalletInput {
  protocol: Protocol;
  address: string;
}

export interface IdentifyWithWalletOutput {
  code: string;
  message: string;
}

export const msgToSign = (code: string): string =>
  `We need your permission to login. ${code}`;

export class IdentifyWithWallet extends UseCase<
  IdentifyWithWalletInput,
  IdentifyWithWalletOutput
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

  async exec(
    data: IdentifyWithWalletInput
  ): Promise<Result<IdentifyWithWalletOutput>> {
    let user: User;

    let wallet = await this.walletRepository.findByAddress(
      data.protocol,
      data.address
    );

    if (!wallet || !wallet.ownerId) {
      user = new User({
        id: generateUserId()
      });

      user = await this.userRepository.create(user);

      if (!wallet) {
        wallet = new Wallet({
          id: generateWalletId(),
          type: WalletType.EXTERNAL,
          protocol: data.protocol,
          ownerId: user.id,
          address: data.address.trim().toLowerCase() // @BeforeInsert Trim and convert to lowercase
        });

        wallet = await this.walletRepository.create(wallet);
      } else {
        wallet.ownerId = user.id;
        wallet = await this.walletRepository.update(wallet);
      }

      user.walletId = wallet.id;
      user = await this.userRepository.update(user);
    }

    if (!user) {
      user = await this.userRepository.get(wallet.ownerId);

      user.loginCode = User.newLoginCode();
      user = await this.userRepository.update(user);
    }

    const encryptedCode = encryptText(user.loginCode.value);

    return Result.ok({
      code: encryptedCode,
      message: msgToSign(encryptedCode)
    });
  }
}
