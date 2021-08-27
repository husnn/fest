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

export const getImageUrl = (
  sourceUrl: string,
  params?: {
    width?: number;
    height?: number;
    maxWidth?: number;
    maxHeight?: number;
    fit?: 'crop';
  },
  override = false
) => {
  let endpoint;
  const baseUrl = process.env.NEXT_PUBLIC_IMAGES_URL;

  if (!override) {
    const el = document.createElement('a');
    el.href = sourceUrl;

    endpoint = el.pathname.split('/').pop();
  }

  const p = params
    ? {
        ...(params.width && { w: params.width }),
        ...(params.height && { h: params.height }),
        ...(params.maxWidth && { 'max-w': params.maxWidth }),
        ...(params.maxHeight && { 'max-h': params.maxHeight }),
        ...(params.fit && { fit: params.fit })
      }
    : undefined;

  const qs = Object.keys(p)
    .map((key) => `${key}=${p[key]}`)
    .join('&');

  const url =
    baseUrl && !override
      ? `${baseUrl}/${endpoint || sourceUrl}?${qs}`
      : sourceUrl;

  return url;
};
