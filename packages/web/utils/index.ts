import Web3 from 'web3';

import { TokenDTO, TokenOwnershipDTO, UserDTO, WalletDTO } from '@fanbase/shared';

export const getTokenUrl = (token?: TokenDTO, id?: string): string =>
  `/tokens/${token ? token.id : id}`;

export const getTokenOwnershipUrl = (ownership: TokenOwnershipDTO): string =>
  `${getTokenUrl(null, ownership.tokenId)}?o=${ownership.id}`;

export const getProfileUrl = ({
  username,
  id
}: {
  username?: string;
  id?: string;
}): string => `/u/${username || id}`;

export const specific =
  <T>() =>
  <U extends T>(argument: U): U =>
    argument;

export const truncateAddress = (
  address: string,
  start = 8,
  end = 4
): string => {
  if (address.length <= start + end) return address;

  return (
    address.substr(0, start) + '...' + address.substr(address.length - end)
  );
};

export const getDisplayName = (user?: UserDTO, wallet?: WalletDTO): string =>
  (user &&
    (user.name ||
      user.username ||
      (user.wallet && truncateAddress(user.wallet.address)))) ||
  (wallet && truncateAddress(wallet.address));

export const waitFor = (ms: number): Promise<void> =>
  new Promise((res) => setTimeout(res, ms));

export const getPrice = (contract: string, wei: string) => {
  return {
    currency: '$',
    amount: parseFloat(Web3.utils.fromWei(wei))
  };
};
