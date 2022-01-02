import '../styles/globals.scss';

import ApiClient from '../modules/api/ApiClient';
import type { AppProps } from 'next/app';
import AuthProvider from '../modules/auth/AuthProvider';
import AxiosClient from '../modules/api/AxiosClient';
import DefaultTheme from '../styles/themes/DefaultTheme';
import Header from '../components/Header';
import HeaderProvider from '../modules/navigation/HeaderProvider';
import React from 'react';
import { ThemeProvider } from '@emotion/react';
import Web3Provider from '../modules/web3/Web3Provider';

const axiosClient = new AxiosClient();
new ApiClient(axiosClient);

function FanbaseApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={DefaultTheme}>
      <AuthProvider>
        <Web3Provider>
          <HeaderProvider>
            <Header />
            <Component {...pageProps} />
          </HeaderProvider>
        </Web3Provider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default FanbaseApp;
