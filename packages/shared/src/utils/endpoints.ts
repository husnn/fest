import { TokenDTO, TokenOwnershipDTO } from '../dto';

export const getHomeUrl = (community?: string) =>
  `/home${community ? `?c=${community}` : ''}`;

export const getCommunityUrl = (id: string) => `/c/${id}`;

export const getTokenUrl = (token?: TokenDTO, id?: string): string =>
  `/tokens/${token ? token.id : id}`;

export const getTokenOwnershipUrl = (ownership: TokenOwnershipDTO): string =>
  `${getTokenUrl(null, ownership.tokenId)}?o=${ownership.id}`;
