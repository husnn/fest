import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { CurrentUserDTO } from '@fanbase/shared';

import { getAuthToken, getCurrentUser, removeAuth } from './authStorage';

type AuthContextProps = {
  isAuthenticated: boolean;
  setAuthenticated: (authenticated: boolean) => void;
  currentUser: CurrentUserDTO | undefined;
  setCurrentUser: (user: CurrentUserDTO) => void;
  setRedirect: (redirect: boolean) => void;
  clearAuth: () => void;
};

export const AuthContext = React.createContext<AuthContextProps | undefined>(
  undefined
);

export const AuthProvider: React.FC = ({
  children
}: {
  children: React.ReactChild[];
}) => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUserDTO>(null);
  const [redirect, setRedirect] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    const isAuthenticated = getAuthToken() != null;

    setAuthenticated(isAuthenticated);
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    if (redirect && !isAuthenticated) {
      router.push(`/login`);
    }
  }, [isAuthenticated, redirect]);

  const clearAuth = () => {
    removeAuth();

    setAuthenticated(false);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setAuthenticated,
        currentUser,
        setCurrentUser,
        setRedirect,
        clearAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
