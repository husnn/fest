import {
  CommunityDTO,
  Currency,
  TokenDTO,
  TokenOwnershipDTO,
  UserDTO,
  WalletDTO
} from '@fest/shared';
import { NextRouter } from 'next/router';
import { getConfig } from '../config';
import { getCurrentUser } from '../modules/auth/authStorage';

export const environment =
  process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV;

export const isProduction = environment === 'production';

export const isStaging = environment === 'staging';

export const isDevelopment = environment === 'development';

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
}): string => `/u/${username || id || getCurrentUser().id}`;

export const getHomeUrl = (community?: CommunityDTO) =>
  `/home${community ? `?c=${community.id}` : ''}`;

export const getCommunityUrl = (community: CommunityDTO) =>
  `/c/${community.id}`;

export const specific =
  <T>() =>
  <U extends T>(argument: U): U =>
    argument;

export const truncateText = (text: string, length: number): string =>
  text.length > length ? text.substr(0, length) + '...' : text;

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
    blur?: number;
  }
) => {
  if (process.env.NODE_ENV === 'development') return sourceUrl;

  let baseUrl;

  const el = document.createElement('a');
  el.href = sourceUrl;

  baseUrl = process.env.NEXT_PUBLIC_IMAGES_URL || el.hostname;

  const p = params
    ? {
        ...(params.width && { w: params.width }),
        ...(params.height && { h: params.height }),
        ...(params.maxWidth && { 'max-w': params.maxWidth }),
        ...(params.maxHeight && { 'max-h': params.maxHeight }),
        ...(params.fit && { fit: params.fit }),
        ...(params.blur && { blur: params.blur })
      }
    : undefined;

  let qs: string;

  if (p) {
    qs = Object.keys(p)
      .map((key) => `${key}=${p[key]}`)
      .join('&');

    baseUrl = process.env.NEXT_PUBLIC_IMGIX_URL || baseUrl;
  }

  return `${baseUrl}${el.pathname}${qs ? '?' + qs : ''}`;
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
    case 137:
    case 80001:
      currency.name = 'Polygon';
      currency.symbol = 'MATIC';
      currency.decimals = 18;
      break;
  }

  return currency;
};

export const getHouseUrl = (community?: CommunityDTO, id?: string): string =>
  `/house${community || id ? `?c=${community ? community.id : id}` : ''}`;

const PREFERRED_COMMUNITY_ID = 'PREFERRED_COMMUNITY_ID';

export const setPreferredCommunity = (community: CommunityDTO) =>
  localStorage.setItem(PREFERRED_COMMUNITY_ID, community.id);

export const getPreferredCommunityId = (): string =>
  localStorage.getItem(PREFERRED_COMMUNITY_ID);

export const getLocalObject = <T>(key: string): T | null => {
  let obj: T | null;
  const data = localStorage.getItem(key);

  if (data) {
    try {
      obj = JSON.parse(data) as T;
    } catch (err) {
      console.log(err);
    }
  }

  return obj;
};

export const saveLocalObject = <T>(key: string, obj: T): T | null => {
  if (obj && typeof obj === 'object' && Object.keys(obj).length > 0) {
    localStorage.setItem(key, JSON.stringify(obj));
    return obj;
  }
  return null;
};

export const updateLocalObject = <T>(
  key: string,
  data: Partial<T>
): T | null => {
  return saveLocalObject<T>(key, {
    ...getLocalObject<T>(key),
    ...data
  });
};
