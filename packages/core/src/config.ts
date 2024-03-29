import { WalletType } from '@fest/shared';

export const isProduction = process.env.NODE_ENV === 'production';

export const isInviteOnly = process.env.INVITE_ONLY === 'true';

export const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

export const emailChangeLink = (
  jwt: string,
  walletType: WalletType,
  expiry: Date
) =>
  `${clientUrl}/email-change?token=${jwt}&walletType=${walletType}&expiry=${expiry.getTime()}`;

export const passwordResetLink = (jwt: string, expiry: Date) =>
  `${clientUrl}/reset-password?token=${jwt}&expiry=${expiry.getTime()}`;
