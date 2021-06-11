import '../styles/globals.css';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { ThemeProvider } from '@emotion/react';
import { CurrentUser } from '@fanbase/shared';

import Header from '../components/Header';
import ApiClient from '../modules/api/ApiClient';
import AxiosClient from '../modules/api/AxiosClient';
import AuthProvider from '../modules/auth/AuthProvider';
import { getCurrentUser, removeAuth } from '../modules/auth/authStorage';
import EthereumClient from '../modules/ethereum/EthereumClient';
import HeaderProvider from '../modules/navigation/HeaderProvider';
import DefaultTheme from '../styles/themes/DefaultTheme';

import type { AppProps } from 'next/app';
const axiosClient = new AxiosClient();

new ApiClient(axiosClient);
new EthereumClient();

function FanbaseApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const [isAuthenticated, setAuthenticated] = useState(true);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    setAuthenticated(getCurrentUser() !== null);
  }, []);

  return (
    <ThemeProvider theme={DefaultTheme}>
      <AuthProvider>
        <HeaderProvider
        // defaultLinks={[
        //   headerLinks.Home,
        //   ...(currentUser
        //     ? [
        //         headerLinks.Profile({
        //           user: currentUser,
        //           onSignOut: () => {
        //             removeAuth();
        //           }
        //         })
        //       ]
        //     : []),
        //   headerLinks.CreateToken,
        //   headerLinks.Login({
        //     isAuthenticated,
        //     onClick: () => {
        //       router.push('/login');
        //     }
        //   })
        // ]}
        >
          <Header />
          <Component {...pageProps} />
        </HeaderProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default FanbaseApp;
