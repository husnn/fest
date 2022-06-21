import React, { useEffect, useState } from 'react';
import { getAuthExpiry, getCurrentUser } from './authStorage';

import { CurrentUserDTO } from '@fest/shared';
import { useRouter } from 'next/router';

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

    if (getAuthExpiry() <= new Date()) {
      clearAuth();
      return;
    }

    setAuthenticated(getAuthExpiry() && !!user);
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    if (redirect && !isAuthenticated) {
      router.push(`/login?redirect=${router.route}`);
    }
  }, [isAuthenticated, redirect]);

  const clearAuth = () => {
    localStorage.clear();

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
