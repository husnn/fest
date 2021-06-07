import { CurrentUser } from '@fanbase/shared';

const AUTH_TOKEN = 'AUTH_TOKEN';
const CURRENT_USER = 'CURRENT_USER';

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN);

export const saveAuthToken = (token: string) => {
  localStorage.setItem(AUTH_TOKEN, token);
};

export const getCurrentUser = (): CurrentUser | null => {
  const user = localStorage.getItem(CURRENT_USER);
  return user ? (JSON.parse(user) as CurrentUser) : null;
};

export const saveCurrentUser = (user: CurrentUser) =>
  localStorage.setItem(CURRENT_USER, JSON.stringify(user));

export const removeAuth = () => {
  localStorage.removeItem(AUTH_TOKEN);
  localStorage.removeItem(CURRENT_USER);
};
