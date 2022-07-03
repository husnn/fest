import { AuthCheck, InviteRepository } from '@fest/core';
import { Protocol, WalletType, encryptText } from '@fest/shared';
import { User, Wallet } from '../../entities';
import { generateUserId, generateWalletId } from '../../utils';

import { Result } from '@fest/shared';
import UseCase from '../../base/UseCase';
import UserRepository from '../../repositories/UserRepository';
import WalletRepository from '../../repositories/WalletRepository';
import { generateInvitesForNewUser } from '../invites';

export interface IdentifyWithWalletInput {
  protocol: Protocol;
  address: string;
  invite?: string;
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

  private authCheck: AuthCheck;

  private inviteRepository: InviteRepository;

  constructor(
    userRepository: UserRepository,
    walletRepository: WalletRepository,
    authCheck: AuthCheck,
    inviteRepository: InviteRepository
  ) {
    super();

    this.userRepository = userRepository;
    this.walletRepository = walletRepository;

    this.authCheck = authCheck;

    this.inviteRepository = inviteRepository;
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
      const check = await this.authCheck.exec({
        wallet: data.address,
        inviteCode: data.invite
      });

      if (!check.success) return Result.fail(check.error);

      user = new User({
        id: generateUserId()(),
        isCreator: check.data.isCreator
      });

      user = await this.userRepository.create(user);

      if (!wallet) {
        wallet = new Wallet({
          id: generateWalletId()(),
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

      generateInvitesForNewUser(
        this.inviteRepository,
        user.id,
        check.data.isCreator
      );
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
