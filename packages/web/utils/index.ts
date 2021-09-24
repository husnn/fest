import { NextRouter } from 'next/router';

import {
  Currency,
  TokenDTO,
  TokenOwnershipDTO,
  UserDTO,
  WalletDTO
} from '@fanbase/shared';
import { fetchInitConfig, getConfig } from '../config';

export const isProduction =
  (process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV) === 'production';

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
  (wallet && truncateAddress(wallet.address)) ||
  'Unnamed';

export const waitFor = (ms: number): Promise<void> =>
  new Promise((res) => setTimeout(res, ms));

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

export const reloadInTime = (router: NextRouter, seconds: number) => {
  setTimeout(() => router.reload(), seconds * 1000);
};

export const getNativeToken = (): Currency => {
  const config = getConfig();

  const currency: Currency = {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
    contract: '0x0'
  };

  switch (config?.protocols['ETHEREUM'].chainId) {
    case 80001:
      currency.name = 'Polygon';
      currency.symbol = 'MATIC';
      currency.decimals = 18;
      break;
  }

  return currency;
};
