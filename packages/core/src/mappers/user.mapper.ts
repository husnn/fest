import { User } from '@fanbase/core';
import { CurrentUserDTO, UserDTO as UserDTO, WalletDTO } from '@fanbase/shared';

export const mapUserToCurrentDTO = (user: User): CurrentUserDTO => {
  return new CurrentUserDTO({
    ...user,
    wallet: new WalletDTO(user.wallet)
  });
};

export const mapUserToDTO = (user: User): UserDTO => {
  return new UserDTO({
    ...user,
    ...(user.wallet && {
      wallet: new WalletDTO({
        id: user.walletId,
        protocol: user.wallet.protocol,
        address: user.wallet.address
      })
    })
  });
};
