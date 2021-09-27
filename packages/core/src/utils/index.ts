import { nanoid } from 'nanoid';

export const generateUserId = () => nanoid(20);
export const generateWalletId = () => nanoid(20);
export const generateTokenId = () => nanoid(16);
export const generateTokenOwnershipId = () => nanoid(16);
export const generateCommunityId = () => nanoid(16);
