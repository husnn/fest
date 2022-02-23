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
import { isDevelopment, isProduction } from '../utils';

const axiosClient = new AxiosClient();
new ApiClient(axiosClient);

const gId = isProduction ? 'G-MEG80DK4ED' : 'G-FD42M526LN';

function FestApp({ Component, pageProps, router }: AppProps) {
  return (
    <ThemeProvider theme={DefaultTheme}>
      {!isDevelopment && (
        <head>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${gId}`}
          />
          <script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              
              gtag('config', '${gId}');
            `}
          </script>
        </head>
      )}
      <AuthProvider>
        <Web3Provider>
          <HeaderProvider>
            {router.pathname !== '/' && <Header />}
            <Component {...pageProps} />
          </HeaderProvider>
        </Web3Provider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default FestApp;
